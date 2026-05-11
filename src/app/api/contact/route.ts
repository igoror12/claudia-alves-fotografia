import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { summarizeContactRequest } from "@/lib/ai";

export const runtime = "nodejs";

// ─── Validação ────────────────────────────────────────────────────
const ContactSchema = z.object({
  name: z.string().trim().min(2, "Indica o teu nome.").max(120),
  email: z.string().trim().email("Email inválido."),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  sessionType: z.string().trim().min(2, "Indica o tipo de sessão.").max(80),
  desiredDate: z.string().trim().max(80).optional().or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(10, "Conta-me um pouco mais (mínimo 10 caracteres).")
    .max(4000),
  website: z.string().max(0).optional().or(z.literal("")),
});

const WINDOW_MS = 60 * 60 * 1000; // 1h
const MAX_PER_HOUR = 5;

// ─── Rate limit in-memory (fallback para single-instance / dev) ───
const recentByIp = new Map<string, number[]>();

function inMemoryRateLimited(ip: string): boolean {
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

// ─── Rate limit distribuído via Upstash Redis REST ────────────────
// Ativa automaticamente quando UPSTASH_REDIS_REST_URL e
// UPSTASH_REDIS_REST_TOKEN estão definidas nas env vars.
// Usa sorted sets para janela deslizante de 1 hora.
// Sem dependências extras — apenas fetch nativo.
// Devolve null se Redis não estiver configurado (sinal para usar fallback).
async function upstashRateLimited(ip: string): Promise<boolean | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const key = `rl:contact:${ip.replace(/[^a-zA-Z0-9.:_-]/g, "_")}`;
  const nowSec = Math.floor(Date.now() / 1000);
  const windowStart = nowSec - 3600;

  try {
    // Pipeline: remover entradas expiradas → contar → adicionar → expirar chave
    const res = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["ZREMRANGEBYSCORE", key, "-inf", String(windowStart)],
        ["ZCARD", key],
        ["ZADD", key, String(nowSec), `${nowSec}:${Math.random().toString(36).slice(2)}`],
        ["EXPIRE", key, "3600"],
      ]),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Array<{ result: unknown }>;
    // data[1] é o ZCARD antes de adicionar a entrada atual
    const count = (data[1]?.result as number) ?? 0;
    return count >= MAX_PER_HOUR;
  } catch {
    // Redis indisponível — cai para in-memory
    return null;
  }
}

async function isRateLimited(ip: string): Promise<boolean> {
  const distributed = await upstashRateLimited(ip);
  return distributed !== null ? distributed : inMemoryRateLimited(ip);
}

/**
 * POST /api/contact
 */
export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  if (await isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Demasiados envios. Tenta novamente daqui a uma hora." },
      { status: 429 }
    );
  }

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

  // Honeypot silencioso
  if (data.website && data.website.length > 0) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

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

  await enrichAndNotify(created.id, {
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
    let ai = {
      summary: "Pedido recebido - sem resumo automatico.",
      estimate: "A definir apos briefing.",
    };

    if (process.env.ANTHROPIC_API_KEY) {
      try {
        ai = await summarizeContactRequest(payload);
        await prisma.contactRequest.update({
          where: { id: requestId },
          data: { aiSummary: ai.summary, aiEstimate: ai.estimate },
        });
      } catch (e) {
        console.error("[contact:ai]", e);
      }
    }

    const resendKey = process.env.RESEND_API_KEY;
    // RESEND_FROM deve ser um remetente verificado no painel Resend.
    // Enquanto o domínio claudiaalves.pt não tiver DNS verificado, usa
    // "onboarding@resend.dev" (domínio de teste pré-verificado pelo Resend).
    const fromAddress =
      process.env.RESEND_FROM ?? "Cláudia Alves <onboarding@resend.dev>";

    async function sendEmail(to: string, subject: string, html: string, replyTo?: string) {
      if (!resendKey) return;
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromAddress,
          to,
          subject,
          html,
          ...(replyTo ? { reply_to: replyTo } : {}),
        }),
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "(sem body)");
        console.error(`[contact:resend] ${res.status} ao enviar para ${to}: ${body}`);
      }
    }

    // 2. Notificação para a fotógrafa
    const notify = process.env.NOTIFY_EMAIL;
    if (resendKey && notify) {
      const html = `
        <h2 style="font-family:Georgia,serif">Novo pedido de contacto</h2>
        <p><strong>${escapeHtml(payload.name)}</strong> &lt;${escapeHtml(payload.email)}&gt;</p>
        <p><em>Sessão:</em> ${escapeHtml(payload.sessionType)}<br/>
           <em>Data pretendida:</em> ${escapeHtml(payload.desiredDate ?? "-")}</p>
        <hr/>
        <p style="white-space:pre-wrap">${escapeHtml(payload.message)}</p>
        <hr/>
        <p><strong>Resumo IA:</strong> ${escapeHtml(ai.summary)}</p>
        <p><strong>Estimativa:</strong> ${escapeHtml(ai.estimate)}</p>
      `;
      await sendEmail(
        notify,
        `Novo contacto · ${payload.sessionType} · ${payload.name}`,
        html,
        payload.email
      );
    }

    // 3. Email de confirmação ao cliente
    if (resendKey) {
      const firstName = payload.name.split(" ")[0];
      const dateNote = payload.desiredDate
        ? ` para <strong>${escapeHtml(payload.desiredDate)}</strong>`
        : "";
      const clientHtml = `
        <div style="font-family:Georgia,serif;color:#2e2820;max-width:520px;margin:0 auto;line-height:1.7">
          <p>Olá ${escapeHtml(firstName)},</p>
          <p>Recebi o teu pedido de sessão de
            <strong>${escapeHtml(payload.sessionType)}</strong>${dateNote}.
            Entrarei em contacto em breve para te dar todos os detalhes!</p>
          <p>Enquanto isso, podes ver o meu portfolio em
            <a href="https://claudiaalves.pt" style="color:#c9a882">claudiaalves.pt</a>.</p>
          <p style="margin-top:2.5em;color:#9e8e7e;font-size:0.9em">
            Com carinho,<br/>
            <strong style="color:#2e2820;font-size:1em">Cláudia Alves</strong><br/>
            Fotografia · Braga, Portugal
          </p>
        </div>
      `;
      await sendEmail(
        payload.email,
        "O teu pedido chegou · Cláudia Alves Fotografia",
        clientHtml
      );
    }
  } catch (e) {
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
