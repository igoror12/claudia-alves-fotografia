import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Cursor } from "@/components/Cursor";
import { Reveal } from "@/components/Reveal";

export const revalidate = 600;

const PAGE_SIZE = 9;

const MONTHS_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function formatDate(d: Date | null) {
  if (!d) return "";
  return `${d.getDate()} ${MONTHS_PT[d.getMonth()]} ${d.getFullYear()}`;
}

export const metadata: Metadata = {
  title: "Blog de Fotografia em Braga",
  description:
    "Dicas, bastidores e histórias sobre retratos, branding e eventos em Braga. Inspira-te e prepara a tua próxima sessão fotográfica.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog de Fotografia em Braga",
    description:
      "Dicas e histórias de fotografia por Cláudia Alves Fotografia.",
    url: "/blog",
  },
};

type Props = { searchParams: { page?: string } };

export default async function BlogListPage({ searchParams }: Props) {
  const page = Math.max(1, Number(searchParams.page ?? 1));
  const skip = (page - 1) * PAGE_SIZE;

  const [posts, total] = await Promise.all([
    prisma.blogPost
      .findMany({
        where: { published: true },
        orderBy: { publishedAt: "desc" },
        skip,
        take: PAGE_SIZE,
      })
      .catch(() => []),
    prisma.blogPost
      .count({ where: { published: true } })
      .catch(() => 0),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <Cursor />
      <Reveal />
      <Nav />

      <main className="px-6 sm:px-12 pt-32 pb-20">
        <header className="max-w-6xl mx-auto mb-16 reveal">
          <Link
            href="/#blog"
            className="text-[0.7rem] uppercase tracking-[0.2em] text-warm-mid hover:text-ink transition-colors inline-flex items-center gap-2 mb-6"
          >
            <span>←</span> Homepage
          </Link>
          <p className="text-[0.7rem] uppercase tracking-[0.25em] text-accent mb-2">
            Reflexões &amp; histórias
          </p>
          <h1 className="font-serif text-[3rem] sm:text-[3.5rem] font-light leading-[1.1] text-ink">
            Do meu{" "}
            <em className="italic text-warm-mid">diário visual</em>
          </h1>
        </header>

        <div className="max-w-6xl mx-auto">
          {posts.length === 0 ? (
            <p className="text-center py-16 text-warm-mid italic">
              Em breve, novas histórias do diário visual.
            </p>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="blog-card reveal block"
                >
                  <div className="aspect-[3/2] overflow-hidden mb-5 relative bg-warm-light">
                    {post.coverUrl && (
                      <Image
                        src={post.coverUrl}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="blog-thumb-img object-cover"
                      />
                    )}
                  </div>
                  <div className="text-[0.65rem] uppercase tracking-[0.2em] text-accent mb-2">
                    {post.category}
                  </div>
                  <h2 className="blog-title font-serif text-[1.4rem] font-light leading-[1.3] mb-3 text-ink">
                    {post.title}
                  </h2>
                  <p className="text-[0.82rem] leading-[1.7] text-warm-mid mb-4">
                    {post.excerpt}
                  </p>
                  <div className="text-xs uppercase tracking-[0.1em] text-warm-light">
                    {formatDate(post.publishedAt)}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <nav
              aria-label="Paginação"
              className="flex justify-between items-center mt-16 pt-8 border-t border-warm-light/50"
            >
              <div>
                {page > 1 ? (
                  <Link href={`/blog?page=${page - 1}`} className="btn-link">
                    <span>←</span> Anterior
                  </Link>
                ) : (
                  <span className="text-[0.75rem] uppercase tracking-[0.12em] text-warm-light">
                    Anterior
                  </span>
                )}
              </div>
              <div className="text-[0.7rem] uppercase tracking-[0.15em] text-warm-mid">
                Página {page} de {totalPages}
              </div>
              <div>
                {page < totalPages ? (
                  <Link href={`/blog?page=${page + 1}`} className="btn-link">
                    Seguinte <span>→</span>
                  </Link>
                ) : (
                  <span className="text-[0.75rem] uppercase tracking-[0.12em] text-warm-light">
                    Seguinte
                  </span>
                )}
              </div>
            </nav>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
