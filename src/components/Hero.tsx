import Image from "next/image";
import type { Photo } from "@prisma/client";

type Props = { featured: Photo[] };

export function Hero({ featured }: Props) {
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

      <div className="relative overflow-hidden">
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-[3px]">
          {featured.length >= 3 ? (
            <>
              <HeroImg photo={featured[0]} delayClass="delay-1" rowSpan2 priority />
              <HeroImg photo={featured[1]} delayClass="delay-2" />
              <HeroImg photo={featured[2]} delayClass="delay-3" />
            </>
          ) : (
            <>
              <Placeholder
                gradient="from-[#5A4A3A] via-[#8C7060] to-[#B09080]"
                rowSpan2
                delayClass="delay-1"
              >
                <svg viewBox="0 0 100 120" className="w-3/5 h-3/5 opacity-[0.18]" fill="none">
                  <ellipse cx="50" cy="30" rx="20" ry="22" fill="white" />
                  <path d="M10 120 C10 75 90 75 90 120" fill="white" />
                </svg>
              </Placeholder>
              <Placeholder
                gradient="from-[#EAE0D5] to-[#C8B5A2]"
                delayClass="delay-2"
              >
                <svg viewBox="0 0 100 80" className="w-3/5 h-3/5 opacity-[0.18]" fill="none">
                  <path
                    d="M10 60 Q30 20 50 40 Q70 60 90 30"
                    stroke="white"
                    strokeWidth={2}
                    fill="none"
                  />
                  <circle cx="50" cy="40" r="15" fill="white" opacity="0.5" />
                </svg>
              </Placeholder>
              <Placeholder
                gradient="from-[#6B5848] to-[#9A8070]"
                delayClass="delay-3"
              >
                <svg viewBox="0 0 100 80" className="w-3/5 h-3/5 opacity-[0.18]" fill="none">
                  <rect x="20" y="20" width="60" height="40" rx="2" fill="white" opacity="0.3" />
                  <path d="M30 60 L50 30 L70 60" fill="white" opacity="0.5" />
                </svg>
              </Placeholder>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function Placeholder({
  gradient,
  rowSpan2 = false,
  delayClass = "",
  children,
}: {
  gradient: string;
  rowSpan2?: boolean;
  delayClass?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`hero-tile anim-fade-in ${delayClass} ${rowSpan2 ? "row-span-2" : ""}`}
    >
      <div
        className={`hero-tile-inner bg-gradient-to-br ${gradient} flex items-center justify-center min-h-[200px]`}
      >
        {children}
      </div>
    </div>
  );
}

function HeroImg({
  photo,
  rowSpan2 = false,
  delayClass = "",
  priority,
}: {
  photo: Photo;
  rowSpan2?: boolean;
  delayClass?: string;
  priority?: boolean;
}) {
  return (
    <div
      className={`hero-tile anim-fade-in ${delayClass} ${rowSpan2 ? "row-span-2" : ""}`}
    >
      <div className="hero-tile-inner">
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
      </div>
    </div>
  );
}
