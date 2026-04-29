import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-cream">
      {session && (
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
