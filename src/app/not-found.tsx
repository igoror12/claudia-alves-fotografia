import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Página não encontrada",
  robots: { index: false, follow: true },
};

/**
 * Página 404 — apresentada quando o utilizador chega a uma URL que
 * não existe. Mantém o tom editorial do site em vez de mostrar a
 * página default técnica do Next.
 */
export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <p className="text-[0.7rem] uppercase tracking-[0.3em] text-accent mb-6">
        404
      </p>
      <h1 className="font-serif text-[3rem] sm:text-[4rem] font-light leading-[1.05] text-ink mb-6 max-w-2xl">
        Esta página
        <br />
        <em className="italic text-warm-mid">não existe</em>
      </h1>
      <p className="text-[0.95rem] leading-[1.8] text-warm-mid max-w-md mb-12">
        O endereço pode ter mudado, ou a fotografia que procuravas já não
        está publicada. Volta à homepage para descobrir os trabalhos
        recentes.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-6">
        <Link href="/" className="btn-primary">
          <span>Voltar ao início</span>
          <span>→</span>
        </Link>
        <Link href="/galeria" className="btn-link">
          Ver galeria <span>→</span>
        </Link>
      </div>
    </main>
  );
}
