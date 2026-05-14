"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import type { Photo, Category } from "@prisma/client";
import { getCategoryLabel } from "@/lib/category-labels";

type PhotoWithCategory = Photo & { category?: Category };

type Props = {
  photos: PhotoWithCategory[];
  index: number;
  onClose: () => void;
  onNavigate: (newIndex: number) => void;
};

export function Lightbox({ photos, index, onClose, onNavigate }: Props) {
  const photo = photos[index];
  const touchStartX = useRef<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft" && index > 0) {
        onNavigate(index - 1);
      } else if (e.key === "ArrowRight" && index < photos.length - 1) {
        onNavigate(index + 1);
      } else if (e.key === "Tab") {
        const controls = Array.from(
          document.querySelectorAll<HTMLButtonElement>("[data-lightbox-control]")
        ).filter((button) => !button.disabled);
        if (controls.length === 0) return;

        const first = controls[0];
        const last = controls[controls.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus();
    };
  }, [index, photos.length, onClose, onNavigate]);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (delta < -50 && index < photos.length - 1) onNavigate(index + 1);
    else if (delta > 50 && index > 0) onNavigate(index - 1);
  }

  if (!photo) return null;

  const hasPrev = index > 0;
  const hasNext = index < photos.length - 1;
  const lightboxSrc = photo.mediumUrl || photo.fullUrl;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/90 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="dialog"
      aria-modal="true"
      aria-label="Visualização da fotografia"
    >
      <button
        ref={closeButtonRef}
        type="button"
        onClick={onClose}
        data-lightbox-control
        aria-label="Fechar"
        className="absolute top-6 right-6 text-cream/70 hover:text-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent transition-colors text-3xl font-light leading-none w-12 h-12 flex items-center justify-center"
      >
        ×
      </button>

      <div className="absolute top-6 left-6 text-[0.65rem] uppercase tracking-[0.2em] text-cream/50">
        {index + 1} / {photos.length}
      </div>

      {hasPrev && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(index - 1);
          }}
          data-lightbox-control
          aria-label="Fotografia anterior"
          className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 text-cream/70 hover:text-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent transition-colors text-4xl font-light w-12 h-12 flex items-center justify-center"
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
          data-lightbox-control
          aria-label="Próxima fotografia"
          className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 text-cream/70 hover:text-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent transition-colors text-4xl font-light w-12 h-12 flex items-center justify-center"
        >
          ›
        </button>
      )}

      <div
        className="relative flex w-[92vw] max-w-[1400px] max-h-[88vh] flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-[78vh] max-h-[820px] w-full">
          <Image
            src={lightboxSrc}
            alt={photo.altText}
            fill
            sizes="92vw"
            className="object-contain"
            placeholder="blur"
            blurDataURL={photo.blurDataUrl}
            quality={82}
            priority
          />
        </div>
        <div className="text-center">
          {photo.category && (
            <p className="text-[0.65rem] uppercase tracking-[0.25em] text-accent mb-1">
              {getCategoryLabel(photo.category)}
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
