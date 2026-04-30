export function About() {
  return (
    <section
      className="px-12 py-24 bg-section-dark grid md:grid-cols-2 gap-24 items-center"
      id="about"
    >
      <div className="about-portrait reveal aspect-[3/4]">
        <div className="about-portrait-img bg-gradient-to-br from-[#5A4838] via-[#8C6A54] to-[#B28E74]" />
        <div className="about-portrait-frame" />
      </div>

      <div className="reveal text-cream">
        <p className="text-[0.7rem] uppercase tracking-[0.25em] text-accent mb-2">
          Sobre mim
        </p>
        <h2 className="font-serif text-[2.8rem] font-light leading-[1.1] mb-8">
          A arte de
          <br />
          <em className="italic text-warm-mid">ver diferente</em>
        </h2>

        <p className="text-[0.9rem] leading-[1.9] text-cream/60 mb-6">
          Nasci em Braga com uma câmara imaginária nas mãos — pelo menos é assim
          que a minha mãe gosta de contar. Desde criança que me fascinava a
          ideia de parar o tempo, de guardar numa imagem aquilo que as palavras
          teimam em não conseguir descrever: um sorriso involuntário, o silêncio
          partilhado entre duas pessoas, a luz que entra pela janela às três da
          tarde de um domingo de inverno.
        </p>
        <p className="text-[0.9rem] leading-[1.9] text-cream/60 mb-6">
          Estudei fotografia no Porto e passei os primeiros anos da minha
          carreira a fotografar tudo e todos — festivais de música, editoriais
          de moda, retratos de rua. Foi nessa imensidão que percebi o que
          realmente me move: as pessoas. A autenticidade dos momentos que
          acontecem quando alguém se esquece que está a ser fotografado.
        </p>
        <p className="text-[0.9rem] leading-[1.9] text-cream/60 mb-6">
          Hoje, com mais de seis anos de experiência, trabalho com casais,
          famílias e empresas em todo o norte de Portugal. A minha abordagem é
          discreta, quase invisível — porque acredito que as melhores
          fotografias nascem da confiança, não da pose.
        </p>

        <div className="font-serif text-[1.6rem] italic font-light text-accent my-8 tracking-[0.03em]">
          Cláudia Alves
        </div>

        <div className="grid grid-cols-3 gap-8 pt-8 border-t border-cream/10">
          {[
            ["200+", "Sessões realizadas"],
            ["80+", "Casamentos"],
            ["5★", "Avaliação média"],
          ].map(([num, label]) => (
            <div key={label}>
              <div className="font-serif text-[2.5rem] font-light text-accent leading-none mb-1">
                {num}
              </div>
              <div className="text-[0.7rem] uppercase tracking-[0.15em] text-cream/40">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
