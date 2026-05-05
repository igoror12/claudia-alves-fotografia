import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Cursor } from "@/components/Cursor";
import { Reveal } from "@/components/Reveal";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Galeria · Todas as categorias",
  description:
    "Portfolio completo de fotografia de Cláudia Alves — retratos, casamentos e eventos em Braga, Portugal.",
};

/**
 * Hub de galeria — uma carta para cada categoria com a foto mais
 * recente como capa + contagem total. Clica para ver tudo da categoria.
 */
export default async function GalleryHub() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: {
      photos: {
        where: { published: true },
        orderBy: [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
        take: 1,
      },
      _count: {
        select: { photos: { where: { published: true } } },
      },
    },
  });

  return (
    <>
      <Cursor />
      <Reveal />
      <Nav />

      <main className="px-6 sm:px-12 pt-32 pb-20">
        <header className="max-w-6xl mx-auto mb-16 reveal">
          <Link
            href="/#portfolio"
            className="text-[0.7rem] uppercase tracking-[0.2em] text-warm-mid hover:text-ink transition-colors inline-flex items-center gap-2 mb-6"
          >
            <span>←</span> Voltar à homepage
          </Link>
          <p className="text-[0.7rem] uppercase tracking-[0.25em] text-accent mb-2">
            Portfolio completo
          </p>
          <h1 className="font-serif text-[3rem] sm:text-[3.5rem] font-light leading-[1.1] text-ink">
            Galeria <em className="italic text-warm-mid">por categoria</em>
          </h1>
        </header>

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const cover = cat.photos[0];
            const total = cat._count.photos;

            return (
              <Link
                key={cat.id}
                href={`/galeria/${cat.slug}`}
                className="reveal group block relative overflow-hidden aspect-[3/4]"
                data-cursor="ver"
              >
                {cover ? (
                  <Image
                    src={cover.fullUrl}
                    alt={cover.altText}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    placeholder="blur"
                    blurDataURL={cover.blurDataUrl}
                    quality={92}
                    className="object-cover transition-transform duration-[800ms] ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-[1.06]"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-warm-light to-warm-mid/30" />
                )}
                <div className="absolute inset-0 bg-ink/35 group-hover:bg-ink/60 transition-colors duration-500 flex items-end p-6 sm:p-8">
                  <div className="text-cream">
                    <p className="text-[0.65rem] uppercase tracking-[0.25em] text-accent mb-2">
                      {total} fotografia{total === 1 ? "" : "s"}
                    </p>
                    <h2 className="font-serif text-3xl font-light italic">
                      {cat.name}
                    </h2>
                    {cat.description && (
                      <p className="text-[0.85rem] leading-[1.6] text-cream/70 mt-3 max-w-xs">
                        {cat.description}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>

      <Footer />
    </>
  );
}
