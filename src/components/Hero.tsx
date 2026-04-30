import Image from "next/image";
import type { Photo } from "@prisma/client";

type Props = { featured: Photo[] };

export function Hero({ featured }: Props) {
  return (
    <section className="hero min-h-screen grid md:grid-cols-2 overflow-hidden">
      <div className="flex flex-col justify-center px-12 pt-32 pb-16 relative z-[2]">
        <p
          className="text-[0.7rem] uppercase tracking-[0.3em] text-accent mb-8 opacity-0 animate-fadeUp"
          style={{ animationDelay: "0.2s" }}
        >
          Fotografia de arte e memória
        </p>
        <h1
          className="font-serif text-[clamp(3.5rem,6vw,5.5rem)] font-light leading-[1.05] -tracking-[0.02em] mb-8 opacity-0 animate-fadeUp"
          style={{ animationDelay: "0.4s" }}
        >
          Cada momento
          <br />
          <em className="italic text-warm-mid block">é eterno</em>
          quando fotografado
        </h1>
        <p
          className="text-sm leading-[1.8] text-warm-mid max-w-[340px] mb-12 opacity-0 animate-fadeUp"
          style={{ animationDelay: "0.6s" }}
        >
          Especialista em retratos, casamentos e eventos. Capturo a emoção
          autêntica e a beleza fugaz dos momentos que merecem durar para sempre.
        </p>
        <div
          className="flex items-center gap-8 opacity-0 animate-fadeUp"
          style={{ animationDelay: "0.8s" }}
        >
          <a href="#portfolio" className="btn-primary">
            <span>Ver Portfolio</span>
            <span>→</span>
          </a>
          <a
            href="#contact"
            className="text-xs uppercase tracking-[0.12em] text-warm-mid hover:text-ink hover:gap-3 inline-flex items-center gap-2 transition-all"
          >
            Agendar sessão <span>→</span>
          </a>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-[3px]">
          {featured.length >= 3 ? (
            <>
              <HeroImg photo={featured[0]} className="row-span-2" priority />
              <HeroImg photo={featured[1]} />
              <HeroImg photo={featured[2]} />
            </>
          ) : (
            // Fallback enquanto não há fotos no admin: gradientes da paleta
            // com silhuetas SVG decorativas (igual ao prototipo aprovado).
            <>
              <Placeholder
                gradient="from-[#5A4A3A] via-[#8C7060] to-[#B09080]"
                className="row-span-2"
              >
                <svg viewBox="0 0 100 120" className="w-3/5 h-3/5 opacity-[0.18]" fill="none">
                  <ellipse cx="50" cy="30" rx="20" ry="22" fill="white" />
                  <path d="M10 120 C10 75 90 75 90 120" fill="white" />
                </svg>
              </Placeholder>
              <Placeholder gradient="from-[#EAE0D5] to-[#C8B5A2]">
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
              <Placeholder gradient="from-[#6B5848] to-[#9A8070]">
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

/**
 * Bloco placeholder com gradiente + silhueta SVG centrada.
 * Reproduz o tratamento visual do protótipo enquanto não há fotografias reais.
 */
function Placeholder({
  gradient,
  className = "",
  children,
}: {
  gradient: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`bg-gradient-to-br ${gradient} flex items-center justify-center min-h-[200px] transition-transform duration-[800ms] hover:scale-[1.04] ${className}`}
    >
      {children}
    </div>
  );
}

function HeroImg({
  photo,
  className,
  priority,
}: {
  photo: Photo;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div className={`relative overflow-hidden group ${className ?? ""}`}>
      <Image
        src={photo.mediumUrl}
        alt={photo.altText}
        fill
        sizes="(max-width: 768px) 100vw, 25vw"
        placeholder="blur"
        blurDataURL={photo.blurDataUrl}
        priority={priority}
        className="object-cover transition-transform duration-[800ms] group-hover:scale-[1.04]"
      />
    </div>
  );
}
