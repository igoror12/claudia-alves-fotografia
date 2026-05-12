import Image from "next/image";
import type { Photo } from "@prisma/client";

type Props = { featured: Photo[] };

/**
 * Hero cinematográfico fullscreen.
 *
 * Estrutura inspirada em aberturas de exposição / filme:
 *  - Fotografia ocupa o ecrã inteiro (object-cover), com vignette duplo
 *    (overlay uniforme + gradient vertical) para garantir legibilidade
 *    do texto sobre qualquer cor de fonte.
 *  - Meta informações no topo em estilo editorial (volume · ano · local).
 *  - Título 4 linhas com reveal escalonado vertical (cada linha 250ms
 *    depois da anterior — tempo lento o suficiente para parecer "abrir
 *    como filme").
 *  - Texto curto + CTAs alinhados em baixo.
 *  - Scroll cue minimalista no fundo do viewport (linha + texto).
 *
 * Sem foto featured: fallback é um gradient grade com SVG silhueta
 * que mantém o tom editorial.
 */
export function Hero({ featured }: Props) {
  const cover = featured[0] ?? null;
  const year = new Date().getFullYear();

  return (
    <section className="hero-cinema relative min-h-screen overflow-hidden">
      {/* ─── Camada de fundo ─────────────────────────────────────── */}
      <div className="absolute inset-0">
        {cover ? (
          <Image
            src={cover.fullUrl}
            alt={cover.altText}
            fill
            sizes="100vw"
            quality={92}
            priority
            placeholder="blur"
            blurDataURL={cover.blurDataUrl}
            className="object-cover hero-cinema-image"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#3C3228] via-[#5A4838] to-[#8C6A54] flex items-center justify-center">
            <svg
              viewBox="0 0 100 120"
              className="w-1/3 h-1/3 opacity-[0.08]"
              fill="none"
              aria-hidden="true"
            >
              <ellipse cx="50" cy="35" rx="22" ry="24" fill="white" />
              <path d="M10 120 C10 70 90 70 90 120" fill="white" />
            </svg>
          </div>
        )}

        {/* Overlay uniforme + vignette vertical para legibilidade */}
        <div className="absolute inset-0 bg-ink/55" aria-hidden="true" />
        <div
          className="absolute inset-0 bg-gradient-to-b from-ink/30 via-transparent to-ink/85"
          aria-hidden="true"
        />
      </div>

      {/* ─── Conteúdo ─────────────────────────────────────────────── */}
      <div className="relative z-10 min-h-screen flex flex-col px-6 sm:px-12 pt-28 sm:pt-32 pb-12">
        {/* Meta info editorial no topo */}
        <header className="hero-reveal r-1 flex justify-between items-start text-[0.6rem] sm:text-[0.65rem] uppercase tracking-[0.3em] text-cream/55">
          <div>Vol. 01 — {year}</div>
          <div className="hidden sm:block">Braga · Portugal</div>
          <div className="text-right">
            <span className="opacity-60">Fotografia</span>
            <span className="block sm:inline sm:ml-2 text-accent">
              Cláudia Alves
            </span>
          </div>
        </header>

        {/* Spacer + Título cinematográfico (parte central-low) */}
        <div className="flex-1 flex flex-col justify-end pb-16 sm:pb-20">
          <p className="hero-reveal r-2 text-[0.65rem] sm:text-[0.7rem] uppercase tracking-[0.32em] text-accent mb-8">
            Um diário de luz
          </p>

          <h1 className="font-serif font-light text-cream leading-[1.02] text-[clamp(2.5rem,9vw,7rem)] tracking-[-0.01em]">
            <span className="hero-reveal r-3 block">Cada</span>
            <span className="hero-reveal r-4 block italic text-cream/75">
              momento
            </span>
            <span className="hero-reveal r-5 block">é eterno quando</span>
            <span className="hero-reveal r-6 block italic text-accent">
              fotografado.
            </span>
          </h1>

          <div className="hero-reveal r-7 mt-12 sm:mt-16 grid sm:grid-cols-12 gap-6 sm:gap-12 items-end">
            <p className="sm:col-span-5 text-[0.9rem] leading-[1.8] text-cream/65 max-w-md">
              Retratos, casamentos e eventos em Braga e em todo o norte de
              Portugal. Capturo a emoção autêntica que merece durar para sempre.
            </p>
            <div className="sm:col-span-7 flex flex-wrap items-center justify-start sm:justify-end gap-5 sm:gap-8">
              <a href="#portfolio" className="btn-primary">
                <span>Ver Portfolio</span>
                <span>→</span>
              </a>
              <a
                href="#contact"
                className="text-[0.75rem] uppercase tracking-[0.15em] text-cream/70 hover:text-cream transition-colors inline-flex items-center gap-2 hover:gap-4"
              >
                Agendar sessão <span>→</span>
              </a>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div
          className="hero-reveal r-8 absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-cream/50"
          aria-hidden="true"
        >
          <span className="text-[0.55rem] uppercase tracking-[0.35em]">
            Scroll
          </span>
          <div className="scroll-cue-line" />
        </div>
      </div>
    </section>
  );
}
