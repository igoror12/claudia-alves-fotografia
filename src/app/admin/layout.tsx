import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Layout do backoffice. NÃO faz redirect aqui — em Next 14 o layout não
 * conhece a pathname de forma fiável, e fazer redirect aqui criaria loop
 * em /admin/login.
 *
 * A defesa em camadas é: middleware bloqueia /admin/* (exceto /login) +
 * cada page admin chama `requireAdminPage()` no topo (ver lib/admin-auth.ts).
 *
 * Aqui só decidimos se mostramos o header de navegação (só faz sentido se
 * a sessão for válida).
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  const showHeader =
    !!session?.user && (role === "ADMIN" || role === "EDITOR");

  return (
    <div className="min-h-screen bg-cream">
      {showHeader && (
        <header className="border-b border-warm-light bg-white px-8 py-4 flex items-center justify-between">
          <Link href="/admin" className="font-serif text-lg text-ink">
            Painel <em className="italic text-accent">Cláudia</em>
          </Link>
          <nav className="flex gap-8 text-xs uppercase tracking-[0.15em] text-warm-mid">
            <Link href="/admin" className="hover:text-ink">Fotos</Link>
            <Link href="/admin/blog" className="hover:text-ink">Blog</Link>
            <Link href="/admin/messages" className="hover:text-ink">Mensagens</Link>
            <Link href="/api/auth/signout" className="hover:text-ink">Sair</Link>
          </nav>
        </header>
      )}
      <main className="px-8 py-10">{children}</main>
    </div>
  );
}
