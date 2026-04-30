"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ContactRequest, ContactStatus } from "@prisma/client";

const STATUS_LABELS: Record<ContactStatus, string> = {
  NEW: "Nova",
  REPLIED: "Respondida",
  BOOKED: "Confirmada",
  ARCHIVED: "Arquivada",
};

const STATUS_COLORS: Record<ContactStatus, string> = {
  NEW: "bg-accent text-white",
  REPLIED: "bg-warm-mid text-white",
  BOOKED: "bg-green-700 text-white",
  ARCHIVED: "bg-warm-light text-warm-mid",
};

const MONTHS_PT = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];

function formatDate(d: Date) {
  const day = d.getDate();
  const month = MONTHS_PT[d.getMonth()];
  const year = d.getFullYear();
  const hh = d.getHours().toString().padStart(2, "0");
  const mm = d.getMinutes().toString().padStart(2, "0");
  return `${day} ${month} ${year} · ${hh}:${mm}`;
}

export function MessagesList({ messages }: { messages: ContactRequest[] }) {
  if (messages.length === 0) {
    return (
      <p className="text-sm text-warm-mid italic">
        Ainda não chegaram mensagens. O formulário de contacto da homepage
        guarda-as aqui automaticamente.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {messages.map((m) => (
        <MessageCard key={m.id} message={m} />
      ))}
    </ul>
  );
}

function MessageCard({ message }: { message: ContactRequest }) {
  const router = useRouter();
  const [open, setOpen] = useState(message.status === "NEW");
  const [isPending, startTransition] = useTransition();

  async function setStatus(status: ContactStatus) {
    const res = await fetch(`/api/admin/messages/${message.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      alert("Erro a atualizar estado.");
      return;
    }
    startTransition(() => router.refresh());
  }

  async function remove() {
    if (!confirm("Apagar esta mensagem? Acção irreversível.")) return;
    const res = await fetch(`/api/admin/messages/${message.id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      alert("Erro a remover.");
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <li className="border border-warm-light bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left px-6 py-4 flex items-start gap-4 hover:bg-cream/50 transition-colors"
      >
        <span
          className={`text-[0.6rem] uppercase tracking-[0.15em] px-2 py-1 ${STATUS_COLORS[message.status]} flex-shrink-0`}
        >
          {STATUS_LABELS[message.status]}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-serif text-lg text-ink truncate">
            {message.name}{" "}
            <span className="text-warm-mid font-sans text-sm">
              · {message.sessionType}
            </span>
          </p>
          <p className="text-xs text-warm-mid mt-0.5">
            {formatDate(new Date(message.createdAt))}
            {message.aiEstimate && (
              <span className="ml-3 text-accent">
                · IA estima: {message.aiEstimate}
              </span>
            )}
          </p>
        </div>
        <span className="text-warm-mid text-xs">{open ? "▴" : "▾"}</span>
      </button>

      {open && (
        <div className="px-6 pb-6 pt-2 border-t border-warm-light/50 space-y-4">
          {message.aiSummary && (
            <div className="bg-accent/5 border-l-2 border-accent px-4 py-3">
              <p className="text-[0.65rem] uppercase tracking-[0.15em] text-accent mb-1">
                Resumo IA
              </p>
              <p className="text-sm text-ink">{message.aiSummary}</p>
            </div>
          )}

          <dl className="grid grid-cols-[120px_1fr] gap-y-2 text-sm">
            <dt className="text-warm-mid uppercase tracking-[0.1em] text-[0.65rem] pt-0.5">
              Email
            </dt>
            <dd>
              <a
                href={`mailto:${message.email}?subject=Re: pedido de ${message.sessionType}`}
                className="text-ink hover:text-accent"
              >
                {message.email}
              </a>
            </dd>
            {message.phone && (
              <>
                <dt className="text-warm-mid uppercase tracking-[0.1em] text-[0.65rem] pt-0.5">
                  Telefone
                </dt>
                <dd>
                  <a href={`tel:${message.phone}`} className="text-ink hover:text-accent">
                    {message.phone}
                  </a>
                </dd>
              </>
            )}
            {message.desiredDate && (
              <>
                <dt className="text-warm-mid uppercase tracking-[0.1em] text-[0.65rem] pt-0.5">
                  Data
                </dt>
                <dd className="text-ink">{message.desiredDate}</dd>
              </>
            )}
            <dt className="text-warm-mid uppercase tracking-[0.1em] text-[0.65rem] pt-0.5">
              Mensagem
            </dt>
            <dd className="text-ink whitespace-pre-wrap leading-relaxed">
              {message.message}
            </dd>
          </dl>

          <div className="flex flex-wrap gap-2 pt-3 border-t border-warm-light/50">
            <button
              type="button"
              onClick={() => setStatus("REPLIED")}
              disabled={isPending || message.status === "REPLIED"}
              className="text-[0.65rem] uppercase tracking-[0.15em] border border-warm-light px-3 py-1.5 hover:border-ink disabled:opacity-40"
            >
              Marcar respondida
            </button>
            <button
              type="button"
              onClick={() => setStatus("BOOKED")}
              disabled={isPending || message.status === "BOOKED"}
              className="text-[0.65rem] uppercase tracking-[0.15em] border border-warm-light px-3 py-1.5 hover:border-ink disabled:opacity-40"
            >
              Confirmar sessão
            </button>
            <button
              type="button"
              onClick={() => setStatus("ARCHIVED")}
              disabled={isPending || message.status === "ARCHIVED"}
              className="text-[0.65rem] uppercase tracking-[0.15em] border border-warm-light px-3 py-1.5 hover:border-ink disabled:opacity-40"
            >
              Arquivar
            </button>
            <button
              type="button"
              onClick={remove}
              disabled={isPending}
              className="text-[0.65rem] uppercase tracking-[0.15em] text-red-600 px-3 py-1.5 hover:bg-red-50 ml-auto"
            >
              Apagar
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
