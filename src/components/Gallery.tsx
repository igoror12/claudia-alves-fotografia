"use client";

import { useState } from "react";
import Image from "next/image";
import type { Photo, Category } from "@prisma/client";

type PhotoWithCategory = Photo & { category: Category };

type Props = {
  photos: PhotoWithCategory[];
  categories: Category[];
};

// Layout de grid masonry-like que reproduz fielmente o prototipo aprovado:
// posições 1-6 têm spans específicos para criar variação visual.
const SPAN_CLASSES = [
  "col-span-12 md:col-span-7 row-span-2 aspect-[4/3]",
  "col-span-12 md:col-span-5 aspect-[5/4]",
  "col-span-12 md:col-span-5 aspect-[5/4]",
  "col-span-12 md:col-span-4 row-span-2 aspect-[3/4]",
  "col-span-12 md:col-span-4 aspect-[4/3]",
  "col-span-12 md:col-span-4 aspect-[4/3]",
];

export function Gallery({ photos, categories }: Props) {
  const [filter, setFilter] = useState<string>("all");

  const visible = photos.filter(
    (p) => filter === "all" || p.category.slug === filter
  );

  return (
    <section className="px-12 py-24" id="portfolio">
      <header className="flex justify-between items-end mb-12 flex-wrap gap-6">
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
          <FilterBtn
            active={filter === "all"}
            onClick={() => setFilter("all")}
          >
            Todos
          </FilterBtn>
          {categories.map((cat) => (
            <FilterBtn
              key={cat.id}
              active={filter === cat.slug}
              onClick={() => setFilter(cat.slug)}
            >
              {cat.name}
            </FilterBtn>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-12 gap-1">
        {visible.slice(0, 6).map((photo, i) => (
          <div
            key={photo.id}
            className={`relative overflow-hidden group ${SPAN_CLASSES[i] ?? "col-span-4 aspect-[4/3]"}`}
          >
            <Image
              src={photo.mediumUrl}
              alt={photo.altText}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              placeholder="blur"
              blurDataURL={photo.blurDataUrl}
              className="object-cover transition-transform duration-[800ms] group-hover:scale-[1.06]"
            />
            <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/50 transition-colors duration-[400ms] flex items-end p-6">
              <div className="opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-[400ms] delay-[50ms]">
                <div className="text-[0.65rem] uppercase tracking-[0.2em] text-accent">
                  {photo.category.name}
                </div>
                <div className="font-serif text-xl font-light text-white italic">
                  {photo.title ?? "Sem título"}
                </div>
              </div>
            </div>
          </div>
        ))}

        {visible.length === 0 && (
          <div className="col-span-12 text-center py-16 text-warm-mid">
            Em breve novas fotografias nesta categoria.
          </div>
        )}
      </div>
    </section>
  );
}

function FilterBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-[0.7rem] uppercase tracking-[0.12em] px-5 py-2 border transition-colors ${
        active
          ? "bg-ink text-cream border-ink"
          : "bg-transparent text-warm-mid border-warm-light hover:bg-ink hover:text-cream hover:border-ink"
      }`}
    >
      {children}
    </button>
  );
}
