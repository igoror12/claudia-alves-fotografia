import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/admin-auth";
import { MessagesList } from "@/components/admin/MessagesList";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  await requireAdminPage();

  const messages = await prisma.contactRequest.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  // Contadores rápidos para o cabeçalho
  const counts = messages.reduce(
    (acc, m) => {
      acc[m.status] = (acc[m.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-10">
        <h1 className="font-serif text-4xl font-light text-ink mb-2">
          Mensagens <em className="italic text-accent">— pedidos de contacto</em>
        </h1>
        <p className="text-sm text-warm-mid">
          {messages.length} no total ·{" "}
          <span className="text-ink">{counts.NEW ?? 0} novas</span> ·{" "}
          {counts.REPLIED ?? 0} respondidas · {counts.BOOKED ?? 0} confirmadas ·{" "}
          {counts.ARCHIVED ?? 0} arquivadas
        </p>
      </header>

      <MessagesList messages={messages} />
    </div>
  );
}
