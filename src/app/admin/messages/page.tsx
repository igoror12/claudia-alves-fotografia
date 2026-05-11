import Link from "next/link";
import type { ContactStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/admin-auth";
import { MessagesList } from "@/components/admin/MessagesList";

export const dynamic = "force-dynamic";

const STATUS_FILTERS: { label: string; value: ContactStatus | "" }[] = [
  { label: "Todas", value: "" },
  { label: "Novas", value: "NEW" },
  { label: "Respondidas", value: "REPLIED" },
  { label: "Confirmadas", value: "BOOKED" },
  { label: "Arquivadas", value: "ARCHIVED" },
];

type Props = { searchParams: { status?: string } };

export default async function AdminMessagesPage({ searchParams }: Props) {
  await requireAdminPage();

  const filterStatus = (searchParams.status ?? "") as ContactStatus | "";

  const [messages, grouped] = await Promise.all([
    prisma.contactRequest.findMany({
      where: filterStatus ? { status: filterStatus } : {},
      orderBy: { createdAt: "desc" },
    }),
    prisma.contactRequest.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  const counts = grouped.reduce(
    (acc, g) => {
      acc[g.status] = g._count._all;
      return acc;
    },
    {} as Record<string, number>
  );
  const total = grouped.reduce((s, g) => s + g._count._all, 0);

  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-8">
        <h1 className="font-serif text-4xl font-light text-ink mb-2">
          Mensagens <em className="italic text-accent">— pedidos de contacto</em>
        </h1>
        <p className="text-sm text-warm-mid">
          {total} no total ·{" "}
          <span className="text-ink">{counts.NEW ?? 0} novas</span> ·{" "}
          {counts.REPLIED ?? 0} respondidas · {counts.BOOKED ?? 0} confirmadas ·{" "}
          {counts.ARCHIVED ?? 0} arquivadas
        </p>
      </header>

      {/* Filtros por estado */}
      <nav className="flex flex-wrap gap-2 mb-8" aria-label="Filtrar mensagens">
        {STATUS_FILTERS.map(({ label, value }) => {
          const isActive = filterStatus === value;
          const href = value ? `/admin/messages?status=${value}` : "/admin/messages";
          const badge = value ? (counts[value] ?? 0) : total;
          return (
            <Link
              key={value || "all"}
              href={href}
              className={`text-[0.65rem] uppercase tracking-[0.15em] px-3 py-1.5 border transition-colors ${
                isActive
                  ? "border-ink bg-ink text-cream"
                  : "border-warm-light text-warm-mid hover:border-ink hover:text-ink"
              }`}
            >
              {label}
              {badge > 0 && (
                <span className="ml-1.5 opacity-60">({badge})</span>
              )}
            </Link>
          );
        })}
      </nav>

      <MessagesList messages={messages} />
    </div>
  );
}
