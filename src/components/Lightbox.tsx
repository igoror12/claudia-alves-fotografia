"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { Photo, Category } from "@prisma/client";

type PhotoWithCategory = Photo & { category?: Category };

type Props = {
  photos: PhotoWithCategory[];
  index: number;
  onClose: () => void;
  onNavigate: (newIndex: number) => void;
};

/**
 * Lightbox full-screen para ver fotos no tamanho `fullUrl` (2400px).
 * - Fecha com Esc, clique no fundo, ou no botão ✕.
 * - Navega com setas ← → do teclado ou botões laterais.
 * - Mostra título e categoria por baixo.
 *
 * Não usa biblioteca de modal externa — implementação leve e controlada,
 * com `position: fixed inset-0` + `backdrop-blur` para preservar o tom
 * editorial do site.
 */
export function Lightbox({ photos, index, onClose, onNavigate }: Props) {
  const photo = photos[index];

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft" && index > 0) onNavigate(index - 1);
      else if (e.key === "ArrowRight" && index < photos.length - 1)
        onNavigate(index + 1);
    }
    document.addEventListener("keydown", onKey);
    // Bloqueia scroll da página por trás
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [index, photos.length, onClose, onNavigate]);

  if (!photo) return null;

  const aspect = photo.height > 0 ? photo.width / photo.height : 1;
  const hasPrev = index > 0;
  const hasNext = index < photos.length - 1;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/90 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Visualização da fotografia"
    >
      {/* Botão fechar */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar"
        className="absolute top-6 right-6 text-cream/60 hover:text-cream transition-colors text-3xl font-light leading-none w-12 h-12 flex items-center justify-center"
      >
        ×
      </button>

      {/* Contador */}
      <div className="absolute top-6 left-6 text-[0.65rem] uppercase tracking-[0.2em] text-cream/50">
        {index + 1} / {photos.length}
      </div>

      {/* Setas — só aparecem se houver para onde ir */}
      {hasPrev && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(index - 1);
          }}
          aria-label="Fotografia anterior"
          className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 text-cream/60 hover:text-cream transition-colors text-4xl font-light w-12 h-12 flex items-center justify-center"
        >
          ‹
        </button>
      )}
      {hasNext && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(index + 1);
          }}
          aria-label="Próxima fotografia"
          className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 text-cream/60 hover:text-cream transition-colors text-4xl font-light w-12 h-12 flex items-center justify-center"
        >
          ›
        </button>
      )}

      {/* Imagem + meta */}
      <div
        className="relative max-w-[90vw] max-h-[85vh] flex flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="relative max-w-full max-h-[78vh]"
          style={{
            aspectRatio: aspect.toString(),
            width: aspect >= 1 ? "min(90vw, 78vh * " + aspect + ")" : "auto",
            height: aspect < 1 ? "min(78vh, 90vw / " + aspect + ")" : "auto",
          }}
        >
          <Image
            src={photo.fullUrl}
            alt={photo.altText}
            fill
            sizes="90vw"
            className="object-contain"
            placeholder="blur"
            blurDataURL={photo.blurDataUrl}
            priority
          />
        </div>
        <div className="text-center">
          {photo.category && (
            <p className="text-[0.65rem] uppercase tracking-[0.25em] text-accent mb-1">
              {photo.category.name}
            </p>
          )}
          {photo.title && (
            <p className="font-serif text-xl italic text-cream font-light">
              {photo.title}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
