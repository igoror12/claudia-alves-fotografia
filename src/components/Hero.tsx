import Image from "next/image";
import type { Photo } from "@prisma/client";

type Props = { featured: Photo[] };

/**
 * Cada slot do hero renderiza independentemente: se há foto disponível
 * para esse índice, mostra a foto; senão, mostra um placeholder gradiente
 * com SVG. Assim funciona perfeitamente com 0, 1, 2 ou 3+ fotos sem
 * efeitos esquisitos de "tudo-ou-nada".
 */
const PLACEHOLDERS = [
  {
    gradient: "from-[#5A4A3A] via-[#8C7060] to-[#B09080]",
    svg: (
      <svg viewBox="0 0 100 120" className="w-3/5 h-3/5 opacity-[0.18]" fill="none">
        <ellipse cx="50" cy="30" rx="20" ry="22" fill="white" />
        <path d="M10 120 C10 75 90 75 90 120" fill="white" />
      </svg>
    ),
  },
  {
    gradient: "from-[#EAE0D5] to-[#C8B5A2]",
    svg: (
      <svg viewBox="0 0 100 80" className="w-3/5 h-3/5 opacity-[0.18]" fill="none">
        <path d="M10 60 Q30 20 50 40 Q70 60 90 30" stroke="white" strokeWidth={2} fill="none" />
        <circle cx="50" cy="40" r="15" fill="white" opacity="0.5" />
      </svg>
    ),
  },
  {
    gradient: "from-[#6B5848] to-[#9A8070]",
    svg: (
      <svg viewBox="0 0 100 80" className="w-3/5 h-3/5 opacity-[0.18]" fill="none">
        <rect x="20" y="20" width="60" height="40" rx="2" fill="white" opacity="0.3" />
        <path d="M30 60 L50 30 L70 60" fill="white" opacity="0.5" />
      </svg>
    ),
  },
];

export function Hero({ featured }: Props) {
  // Cada slot renderiza foto OU placeholder, independentemente dos outros.
  const slots = [0, 1, 2].map((i) => featured[i] ?? null);

  return (
    <section className="hero min-h-screen grid md:grid-cols-2 overflow-hidden">
      <div className="flex flex-col justify-center px-6 pt-32 pb-16 sm:px-12 relative z-[2]">
        <p className="anim-fade-up delay-1 text-[0.68rem] uppercase tracking-[0.18em] sm:tracking-[0.3em] text-accent mb-8 max-w-full">
          Fotografia de arte e memória
        </p>
        <h1 className="anim-fade-up delay-2 font-serif text-[clamp(2.75rem,15vw,5.5rem)] font-light leading-[1.05] mb-8 max-w-full">
          Cada momento
          <br />
          <em className="italic text-warm-mid block">é eterno</em>
          quando fotografado
        </h1>
        <p className="anim-fade-up delay-3 text-[0.9rem] leading-[1.8] text-warm-mid max-w-[340px] mb-12">
          Especialista em retratos, casamentos e eventos. Capturo a emoção
          autêntica e a beleza fugaz dos momentos que merecem durar para sempre.
        </p>
        <div className="anim-fade-up delay-4 flex flex-wrap items-center gap-5 sm:gap-8">
          <a href="#portfolio" className="btn-primary">
            <span>Ver Portfolio</span>
            <span>→</span>
          </a>
          <a href="#contact" className="btn-link">
            Agendar sessão <span>→</span>
          </a>
        </div>
      </div>

      <div className="relative overflow-hidden min-h-[60vh] md:min-h-screen bg-warm-light/20">
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-[3px]">
          {/* Slot 0: ocupa coluna 1 inteira (rowSpan 2) */}
          <HeroSlot photo={slots[0]} placeholder={PLACEHOLDERS[0]} rowSpan2 priority />
          {/* Slot 1: top-right */}
          <HeroSlot photo={slots[1]} placeholder={PLACEHOLDERS[1]} />
          {/* Slot 2: bottom-right */}
          <HeroSlot photo={slots[2]} placeholder={PLACEHOLDERS[2]} />
        </div>
      </div>
    </section>
  );
}

/**
 * Um slot único do grid: foto se existir, placeholder gradiente caso contrário.
 * Crítico: o `.hero-tile-inner` precisa de `position: relative` para que
 * o <Image fill> se posicione corretamente dentro dele.
 */
function HeroSlot({
  photo,
  placeholder,
  rowSpan2 = false,
  priority = false,
}: {
  photo: Photo | null;
  placeholder: { gradient: string; svg: React.ReactNode };
  rowSpan2?: boolean;
  priority?: boolean;
}) {
  // CRÍTICO: NÃO adicionar `anim-fade-in` aqui. Em globals.css, `.hero-tile`
  // define `animation: heroDrift` no shorthand, e como vem mais abaixo no
  // ficheiro, sobrescreve o `animation: fadeIn` da `.anim-fade-in`. O bug
  // resultante: opacity fica stuck em 0 e a foto é invisível. A entrada
  // cinematográfica vem do `heroZoomIn` aplicado em `.hero-tile-inner`.
  return (
    <div className={`hero-tile ${rowSpan2 ? "row-span-2" : ""}`}>
      <div className="hero-tile-inner">
        {photo ? (
          <Image
            src={photo.mediumUrl}
            alt={photo.altText}
            fill
            sizes="(max-width: 768px) 100vw, 25vw"
            placeholder="blur"
            blurDataURL={photo.blurDataUrl}
            priority={priority}
            className="object-cover"
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-br ${placeholder.gradient} flex items-center justify-center`}
          >
            {placeholder.svg}
          </div>
        )}
      </div>
    </div>
  );
}
