"use client";

import { useState } from "react";
import Image from "next/image";
import type { Photo, Category } from "@prisma/client";

type PhotoWithCategory = Photo & { category: Category };

type Props = {
  photos: PhotoWithCategory[];
  categories: Category[];
};

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

      <div className="grid grid-cols-12 gap-1">
        {visible.slice(0, 6).map((photo, i) => (
          <div
            key={photo.id}
            className={`gallery-item reveal ${SPAN_CLASSES[i] ?? "col-span-4 aspect-[4/3]"}`}
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
