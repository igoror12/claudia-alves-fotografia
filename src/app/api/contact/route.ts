import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { summarizeContactRequest } from "@/lib/ai";

export const runtime = "nodejs";

// ─── Validação ────────────────────────────────────────────────────
// Mantém-se permissiva nos opcionais (a fotógrafa prefere receber
// mensagens incompletas a perder leads por validação rígida).
const ContactSchema = z.object({
  name: z.string().trim().min(2, "Indica o teu nome.").max(120),
  email: z.string().trim().email("Email inválido."),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  sessionType: z
    .string()
    .trim()
    .min(2, "Indica o tipo de sessão.")
    .max(80),
  desiredDate: z.string().trim().max(80).optional().or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(10, "Conta-me um pouco mais (mínimo 10 caracteres).")
    .max(4000),
  // Honeypot — campo escondido. Bots preenchem; humanos não.
  website: z.string().max(0).optional().or(z.literal("")),
});

// ─── Rate limit em memória (best-effort, OK para single-instance) ─
// Em produção numa Vercel multi-instância, fica como linha de defesa
// secundária; a primeira é o honeypot + email único.
const recentByIp = new Map<string, number[]>();
const WINDOW_MS = 60 * 60 * 1000; // 1h
const MAX_PER_HOUR = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (recentByIp.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (arr.length >= MAX_PER_HOUR) {
    recentByIp.set(ip, arr);
    return true;
  }
  arr.push(now);
  recentByIp.set(ip, arr);
  return false;
}

/**
 * POST /api/contact
 * Cria um ContactRequest, gera resumo+estimativa com Claude
 * (best-effort, não bloqueia a resposta) e opcionalmente envia
 * notificação por email via Resend.
 */
export async function POST(req: NextRequest) {
  // Rate limit
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Demasiados envios. Tenta novamente daqui a uma hora." },
      { status: 429 }
    );
  }

  // Parse + validação
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const parsed = ContactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Pedido inválido." },
      { status: 400 }
    );
  }
  const data = parsed.data;

  // Honeypot silencioso — devolvemos OK para bots não tentarem outra vez
  if (data.website && data.website.length > 0) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  // Persiste primeiro (não perdemos leads se a IA falhar)
  const created = await prisma.contactRequest.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      sessionType: data.sessionType,
      desiredDate: data.desiredDate || null,
      message: data.message,
    },
  });

  // IA + email em paralelo, best-effort
  void enrichAndNotify(created.id, {
    name: data.name,
    email: data.email,
    sessionType: data.sessionType,
    desiredDate: data.desiredDate || undefined,
    message: data.message,
  });

  return NextResponse.json({ ok: true, id: created.id });
}

// ─── Enriquecimento assíncrono ───────────────────────────────────
async function enrichAndNotify(
  requestId: string,
  payload: {
    name: string;
    email: string;
    sessionType: string;
    desiredDate?: string;
    message: string;
  }
) {
  try {
    // 1. Resumo + estimativa com Claude
    const ai = await summarizeContactRequest(payload);
    await prisma.contactRequest.update({
      where: { id: requestId },
      data: { aiSummary: ai.summary, aiEstimate: ai.estimate },
    });

    // 2. Email opcional (só envia se RESEND_API_KEY estiver configurada)
    const resendKey = process.env.RESEND_API_KEY;
    const notify = process.env.NOTIFY_EMAIL;
    if (!resendKey || !notify) return;

    const subject = `Novo contacto · ${payload.sessionType} · ${payload.name}`;
    const html = `
      <h2 style="font-family:Georgia,serif">Novo pedido de contacto</h2>
      <p><strong>${payload.name}</strong> &lt;${payload.email}&gt;</p>
      <p><em>Sessão:</em> ${payload.sessionType}<br/>
         <em>Data pretendida:</em> ${payload.desiredDate ?? "—"}</p>
      <hr/>
      <p style="white-space:pre-wrap">${escapeHtml(payload.message)}</p>
      <hr/>
      <p><strong>Resumo IA:</strong> ${escapeHtml(ai.summary)}</p>
      <p><strong>Estimativa:</strong> ${escapeHtml(ai.estimate)}</p>
    `;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Cláudia Alves <noreply@claudiaalves.pt>",
        to: notify,
        reply_to: payload.email,
        subject,
        html,
      }),
    });
  } catch (e) {
    // Não propaga — o pedido já está em DB, a Cláudia vê no admin de qualquer forma.
    console.error("[contact:enrichAndNotify]", e);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
