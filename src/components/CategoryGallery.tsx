"use client";

import { useState } from "react";
import Image from "next/image";
import type { Photo, Category } from "@prisma/client";
import { Lightbox } from "./Lightbox";

type PhotoWithCategory = Photo & { category: Category };

/**
 * Galeria masonry-light para a página /galeria/[categoria].
 * - Grid responsive: 2 cols mobile, 3 tablet, 4 desktop.
 * - Cada item respeita o aspect-ratio nativo da foto (não força crop).
 * - Lightbox ao clicar.
 *
 * Em vez de layouts hardcoded como na homepage, aqui usamos cálculo
 * automático: o grid CSS distribui as fotos uniformemente. Mantém o
 * tom editorial sem necessidade de "designar" cada posição.
 */
export function CategoryGallery({ photos }: { photos: PhotoWithCategory[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
        {photos.map((photo, i) => {
          const aspect = photo.height > 0 ? photo.width / photo.height : 1;
          return (
            <button
              type="button"
              key={photo.id}
              className="gallery-item reveal"
              data-cursor="ver"
              style={{ aspectRatio: aspect.toString() }}
              onClick={() => setLightboxIndex(i)}
              aria-label={`Abrir fotografia: ${photo.altText}`}
            >
              <Image
                src={photo.mediumUrl}
                alt={photo.altText}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                placeholder="blur"
                blurDataURL={photo.blurDataUrl}
                className="gallery-img"
              />
              <div className="gallery-overlay">
                <div className="gallery-meta">
                  {photo.title && (
                    <div className="font-serif text-base font-light text-white italic">
                      {photo.title}
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          photos={photos}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </>
  );
}
