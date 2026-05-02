"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Photo, Category } from "@prisma/client";
import { Lightbox } from "./Lightbox";

type PhotoWithCategory = Photo & { category: Category };

type Props = {
  photos: PhotoWithCategory[];
  categories: Category[];
};

/**
 * Layouts adaptativos por número de fotos visíveis.
 * Cada string é uma class Tailwind aplicada ao item — o grid base é
 * sempre 12 colunas. Para 1-6 fotos os layouts são desenhados à mão
 * para preencherem o espaço sem buracos. Acima de 6, mostramos só
 * os primeiros 6 com o masonry editorial e adicionamos botão
 * "Ver todas →" que leva à página da categoria.
 */
const LAYOUTS: Record<number, string[]> = {
  1: ["col-span-12 aspect-[16/9]"],
  2: [
    "col-span-12 md:col-span-6 aspect-[4/3]",
    "col-span-12 md:col-span-6 aspect-[4/3]",
  ],
  3: [
    "col-span-12 md:col-span-6 row-span-2 aspect-[4/5]",
    "col-span-12 md:col-span-6 aspect-[16/9]",
    "col-span-12 md:col-span-6 aspect-[16/9]",
  ],
  4: [
    "col-span-12 md:col-span-6 aspect-[4/3]",
    "col-span-12 md:col-span-6 aspect-[4/3]",
    "col-span-12 md:col-span-6 aspect-[4/3]",
    "col-span-12 md:col-span-6 aspect-[4/3]",
  ],
  5: [
    "col-span-12 md:col-span-7 row-span-2 aspect-[4/3]",
    "col-span-12 md:col-span-5 aspect-[5/4]",
    "col-span-12 md:col-span-5 aspect-[5/4]",
    "col-span-12 md:col-span-6 aspect-[4/3]",
    "col-span-12 md:col-span-6 aspect-[4/3]",
  ],
  6: [
    "col-span-12 md:col-span-7 row-span-2 aspect-[4/3]",
    "col-span-12 md:col-span-5 aspect-[5/4]",
    "col-span-12 md:col-span-5 aspect-[5/4]",
    "col-span-12 md:col-span-4 row-span-2 aspect-[3/4]",
    "col-span-12 md:col-span-4 aspect-[4/3]",
    "col-span-12 md:col-span-4 aspect-[4/3]",
  ],
};

export function Gallery({ photos, categories }: Props) {
  const [filter, setFilter] = useState<string>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const visible = photos.filter(
    (p) => filter === "all" || p.category.slug === filter
  );

  // Mostramos no máximo 6 na home; o resto vai para a página da categoria.
  const display = visible.slice(0, 6);
  const layout = LAYOUTS[display.length] ?? LAYOUTS[6];
  const totalForFilter = visible.length;
  const hasMore = totalForFilter > 6;

  // Link de "Ver todas": se filtro está em "all", leva para galeria geral;
  // senão, para a página da categoria específica.
  const seeAllHref = filter === "all" ? "/galeria" : `/galeria/${filter}`;

  return (
    <section className="px-6 py-20 sm:px-12 sm:py-24" id="portfolio">
      <header className="reveal flex justify-between items-end mb-12 flex-wrap gap-6">
        <div>
          <p className="text-[0.7rem] uppercase tracking-[0.25em] text-accent mb-2">
            Trabalhos selecionados
          </p>
          <h2 className="font-serif text-[2.8rem] font-light leading-[1.1] text-ink">
            Portfolio
            <br />
            <em className="italic text-warm-mid">recente</em>
          </h2>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            type="button"
            className={`filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`filter-btn ${filter === cat.slug ? "active" : ""}`}
              onClick={() => setFilter(cat.slug)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </header>

      {display.length === 0 ? (
        <div className="text-center py-16 text-warm-mid italic">
          {photos.length === 0
            ? "Em breve novas fotografias."
            : "Não há fotografias publicadas nesta categoria ainda."}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-12 gap-1 auto-rows-fr">
            {display.map((photo, i) => (
              <button
                type="button"
                key={photo.id}
                className={`gallery-item gallery-item-link reveal stagger-${(i % 6) + 1} ${layout[i] ?? "col-span-12 md:col-span-4 aspect-[4/3]"}`}
                data-cursor="ver"
                onClick={() => setLightboxIndex(i)}
                aria-label={`Abrir fotografia: ${photo.altText}`}
              >
                <Image
                  src={photo.mediumUrl}
                  alt={photo.altText}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  placeholder="blur"
                  blurDataURL={photo.blurDataUrl}
                  className="gallery-img"
                />
                <div className="gallery-overlay">
                  <div className="gallery-meta">
                    <div className="text-[0.65rem] uppercase tracking-[0.2em] text-accent">
                      {photo.category.name}
                    </div>
                    {photo.title && (
                      <div className="font-serif text-xl font-light text-white italic">
                        {photo.title}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {hasMore && (
            <div className="mt-12 text-center reveal">
              <Link href={seeAllHref} className="btn-link">
                Ver todas as {totalForFilter} fotografias
                <span>→</span>
              </Link>
            </div>
          )}
        </>
      )}

      {lightboxIndex !== null && (
        <Lightbox
          photos={display}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </section>
  );
}
