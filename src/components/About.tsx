import Image from "next/image";

export function About() {
  return (
    <section
      className="px-6 py-20 sm:px-12 sm:py-24 bg-section-dark grid md:grid-cols-2 gap-12 md:gap-24 items-center"
      id="about"
    >
      <div className="about-portrait reveal-left aspect-[3/4]">
        <Image
          src="/images/claudia.jpg"
          alt="Cláudia Alves"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="about-portrait-img object-cover"
        />
        <div className="about-portrait-frame" aria-hidden="true" />
      </div>

      <div className="reveal-right text-cream">
        <p className="text-[0.7rem] uppercase tracking-[0.25em] text-accent mb-2">
          Sobre mim
        </p>
        <h2 className="font-serif text-[2.8rem] font-light leading-[1.1] mb-8">
          A arte de
          <br />
          <em className="italic text-warm-mid">ver diferente</em>
        </h2>

        <p className="text-[0.9rem] leading-[1.9] text-cream/60 mb-6">
          Sou a Cláudia Alves, fotógrafa em Braga, e trabalho com retratos,
          famílias, eventos e branding. Gosto de criar sessões leves, com tempo
          para observar, conversar e deixar que cada pessoa se reconheça nas
          fotografias.
        </p>
        <p className="text-[0.9rem] leading-[1.9] text-cream/60 mb-6">
          A minha abordagem é calma e natural. Procuro a luz certa, os gestos
          pequenos e a expressão que aparece quando a sessão deixa de parecer
          uma sessão. O objetivo é simples: imagens bonitas, honestas e úteis
          para guardar, partilhar ou comunicar uma marca.
        </p>
        <p className="text-[0.9rem] leading-[1.9] text-cream/60 mb-6">
          Fotografo em exterior, em espaços interiores e em contexto de evento,
          adaptando cada trabalho ao ritmo de quem está à minha frente.
        </p>

        <div className="font-serif text-[1.6rem] italic font-light text-accent my-8 tracking-[0.03em]">
          Cláudia Alves
        </div>

        <div className="pt-8 border-t border-cream/10">
          <div>
            <div className="font-serif text-[2rem] sm:text-[2.5rem] font-light text-accent leading-none mb-1">
              200+
            </div>
            <div className="text-[0.65rem] sm:text-[0.7rem] uppercase tracking-[0.12em] sm:tracking-[0.15em] text-cream/40">
              Sessões realizadas
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
