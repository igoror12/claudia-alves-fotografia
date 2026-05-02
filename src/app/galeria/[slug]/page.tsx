import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Cursor } from "@/components/Cursor";
import { Reveal } from "@/components/Reveal";
import { CategoryGallery } from "@/components/CategoryGallery";

export const revalidate = 600;

const PAGE_SIZE = 24;

type Props = {
  params: { slug: string };
  searchParams: { page?: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cat = await prisma.category
    .findUnique({ where: { slug: params.slug } })
    .catch(() => null);
  if (!cat) return { title: "Galeria" };

  return {
    title: `${cat.name} · Galeria`,
    description:
      cat.description ??
      `Portfolio de ${cat.name.toLowerCase()} de Cláudia Alves Fotografia em Braga.`,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const page = Math.max(1, Number(searchParams.page ?? 1));
  const skip = (page - 1) * PAGE_SIZE;

  const cat = await prisma.category
    .findUnique({ where: { slug: params.slug } })
    .catch(() => null);

  if (!cat) notFound();

  const [photos, total] = await Promise.all([
    prisma.photo.findMany({
      where: { categoryId: cat.id, published: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      include: { category: true },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.photo.count({
      where: { categoryId: cat.id, published: true },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <Cursor />
      <Reveal />
      <Nav />

      <main className="px-6 sm:px-12 pt-32 pb-20">
        <header className="max-w-6xl mx-auto mb-12 reveal">
          <Link
            href="/#portfolio"
            className="text-[0.7rem] uppercase tracking-[0.2em] text-warm-mid hover:text-ink transition-colors inline-flex items-center gap-2 mb-6"
          >
            <span>←</span> Portfolio
          </Link>
          <p className="text-[0.7rem] uppercase tracking-[0.25em] text-accent mb-2">
            Categoria
          </p>
          <h1 className="font-serif text-[3rem] sm:text-[3.5rem] font-light leading-[1.1] text-ink">
            <em className="italic text-warm-mid">{cat.name}</em>
          </h1>
          {cat.description && (
            <p className="text-[0.95rem] leading-[1.8] text-warm-mid mt-4 max-w-xl">
              {cat.description}
            </p>
          )}
          <p className="text-xs text-warm-mid mt-6">
            {total} fotografia{total === 1 ? "" : "s"}
          </p>
        </header>

        <div className="max-w-7xl mx-auto">
          {photos.length === 0 ? (
            <p className="text-center py-16 text-warm-mid italic">
              Em breve novas fotografias nesta categoria.
            </p>
          ) : (
            <CategoryGallery photos={photos} />
          )}

          {totalPages > 1 && (
            <Pagination
              base={`/galeria/${cat.slug}`}
              page={page}
              totalPages={totalPages}
            />
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

function Pagination({
  base,
  page,
  totalPages,
}: {
  base: string;
  page: number;
  totalPages: number;
}) {
  const prev = page > 1 ? `${base}?page=${page - 1}` : null;
  const next = page < totalPages ? `${base}?page=${page + 1}` : null;

  return (
    <nav
      aria-label="Paginação"
      className="flex justify-between items-center mt-16 pt-8 border-t border-warm-light/50"
    >
      <div>
        {prev ? (
          <Link href={prev} className="btn-link">
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
        {next ? (
          <Link href={next} className="btn-link">
            Seguinte <span>→</span>
          </Link>
        ) : (
          <span className="text-[0.75rem] uppercase tracking-[0.12em] text-warm-light">
            Seguinte
          </span>
        )}
      </div>
    </nav>
  );
}
