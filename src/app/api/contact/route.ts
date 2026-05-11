import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { summarizeContactRequest } from "@/lib/ai";

export const runtime = "nodejs";

const ContactSchema = z.object({
  name: z.string().trim().min(2, "Indica o teu nome.").max(120),
  email: z.string().trim().email("Email invalido."),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  sessionType: z
    .string()
    .trim()
    .min(2, "Indica o tipo de sessao.")
    .max(80),
  desiredDate: z.string().trim().max(80).optional().or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(10, "Conta-me um pouco mais (minimo 10 caracteres).")
    .max(4000),
  website: z.string().optional().or(z.literal("")),
});

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_HOUR = 5;

// Rate limit in-memory (fallback para single-instance / dev).
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

// Rate limit distribuido via Upstash Redis REST.
// Devolve null se Redis nao estiver configurado, para usar fallback local.
async function upstashRateLimited(ip: string): Promise<boolean | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const key = `rl:contact:${ip.replace(/[^a-zA-Z0-9.:_-]/g, "_")}`;
  const nowSec = Math.floor(Date.now() / 1000);
  const windowStart = nowSec - 3600;

  try {
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
    const count = Number(data[1]?.result ?? 0);
    return count >= MAX_PER_HOUR;
  } catch {
    return null;
  }
}

async function isRateLimited(ip: string): Promise<boolean> {
  const distributed = await upstashRateLimited(ip);
  return distributed !== null ? distributed : inMemoryRateLimited(ip);
}

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
    return NextResponse.json({ error: "JSON invalido." }, { status: 400 });
  }

  const parsed = ContactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Pedido invalido." },
      { status: 400 }
    );
  }

  const data = parsed.data;

  // Honeypot silencioso: para bots, fingimos sucesso.
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

  const ai = await enrichContactRequest(created.id, {
    name: data.name,
    email: data.email,
    sessionType: data.sessionType,
    desiredDate: data.desiredDate || undefined,
    message: data.message,
  });

  try {
    await sendContactEmails(created.id, {
      name: data.name,
      email: data.email,
      phone: data.phone || undefined,
      sessionType: data.sessionType,
      desiredDate: data.desiredDate || undefined,
      message: data.message,
      aiSummary: ai.summary,
      aiEstimate: ai.estimate,
    });
  } catch (e) {
    console.error("[contact:email]", e);
    return NextResponse.json(
      {
        error:
          "A mensagem ficou registada, mas nao foi possivel enviar os emails. Por favor contacta diretamente por email ou telefone.",
        id: created.id,
      },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, id: created.id });
}

async function enrichContactRequest(
  requestId: string,
  payload: {
    name: string;
    email: string;
    sessionType: string;
    desiredDate?: string;
    message: string;
  }
) {
  let ai = {
    summary: "Pedido recebido - sem resumo automatico.",
    estimate: "A definir apos briefing.",
  };

  if (!process.env.ANTHROPIC_API_KEY) return ai;

  try {
    ai = await summarizeContactRequest(payload);
    await prisma.contactRequest.update({
      where: { id: requestId },
      data: { aiSummary: ai.summary, aiEstimate: ai.estimate },
    });
  } catch (e) {
    console.error("[contact:ai]", e);
  }

  return ai;
}

async function sendContactEmails(
  requestId: string,
  payload: {
    name: string;
    email: string;
    phone?: string;
    sessionType: string;
    desiredDate?: string;
    message: string;
    aiSummary: string;
    aiEstimate: string;
  }
) {
  const photographerEmail = process.env.NOTIFY_EMAIL;
  const from =
    process.env.RESEND_FROM_EMAIL ??
    "Claudia Alves Fotografia <noreply@claudiaalves.pt>";

  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  if (!photographerEmail) {
    throw new Error("NOTIFY_EMAIL is not configured.");
  }

  const detailsHtml = contactDetailsHtml(payload);

  await sendResendEmail(
    {
      from,
      to: photographerEmail,
      reply_to: payload.email,
      subject: `Novo contacto - ${payload.sessionType} - ${payload.name}`,
      html: `
        <h2 style="font-family:Georgia,serif">Novo pedido de contacto</h2>
        ${detailsHtml}
        <hr/>
        <p><strong>Resumo IA:</strong> ${escapeHtml(payload.aiSummary)}</p>
        <p><strong>Estimativa:</strong> ${escapeHtml(payload.aiEstimate)}</p>
      `,
    },
    `contact-${requestId}-photographer`
  );

  await sendResendEmail(
    {
      from,
      to: payload.email,
      reply_to: photographerEmail,
      subject: "Recebi o teu pedido - Claudia Alves Fotografia",
      html: `
        <h2 style="font-family:Georgia,serif">Obrigada pelo teu contacto, ${escapeHtml(
          payload.name
        )}.</h2>
        <p>Recebi o teu pedido e vou responder assim que possivel, normalmente em ate 24 horas.</p>
        <p>Segue uma copia dos detalhes que enviaste:</p>
        ${detailsHtml}
        <p style="margin-top:24px">Obrigada,<br/>Claudia Alves</p>
      `,
    },
    `contact-${requestId}-client`
  );
}

type ResendEmail = {
  from: string;
  to: string;
  reply_to?: string;
  subject: string;
  html: string;
};

async function sendResendEmail(email: ResendEmail, idempotencyKey: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify(email),
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      body?.message ??
      body?.error ??
      `Resend request failed with HTTP ${res.status}.`;
    throw new Error(message);
  }

  if (!body?.id) {
    throw new Error("Resend did not return an email id.");
  }
}

function contactDetailsHtml(payload: {
  name: string;
  email: string;
  phone?: string;
  sessionType: string;
  desiredDate?: string;
  message: string;
}) {
  return `
    <p><strong>${escapeHtml(payload.name)}</strong> &lt;${escapeHtml(payload.email)}&gt;</p>
    <p>
      <em>Telefone:</em> ${escapeHtml(payload.phone ?? "-")}<br/>
      <em>Sessao:</em> ${escapeHtml(payload.sessionType)}<br/>
      <em>Data pretendida:</em> ${escapeHtml(payload.desiredDate ?? "-")}
    </p>
    <hr/>
    <p style="white-space:pre-wrap">${escapeHtml(payload.message)}</p>
  `;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
