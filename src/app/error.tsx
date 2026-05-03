"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Página de erro global — apresentada quando uma server component
 * lança uma exceção não-tratada. Tem de ser client component (Next 14
 * requirement). Apresenta UI editorial em vez do default técnico.
 *
 * O `digest` permite cruzar este erro com os logs do Vercel
 * (Runtime Logs → procurar por digest).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Em produção, idealmente reportar para Sentry / Datadog aqui.
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <p className="text-[0.7rem] uppercase tracking-[0.3em] text-accent mb-6">
        Erro inesperado
      </p>
      <h1 className="font-serif text-[3rem] sm:text-[4rem] font-light leading-[1.05] text-ink mb-6 max-w-2xl">
        Algo correu
        <br />
        <em className="italic text-warm-mid">menos bem</em>
      </h1>
      <p className="text-[0.95rem] leading-[1.8] text-warm-mid max-w-md mb-12">
        Pedimos desculpa pelo incómodo. Tenta recarregar a página — se o
        problema persistir, contacta-nos diretamente.
      </p>
      {error.digest && (
        <p className="text-[0.65rem] uppercase tracking-[0.2em] text-warm-light mb-12">
          Referência: {error.digest}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-center gap-6">
        <button type="button" onClick={reset} className="btn-primary">
          <span>Tentar novamente</span>
          <span>↻</span>
        </button>
        <Link href="/" className="btn-link">
          Voltar ao início <span>→</span>
        </Link>
      </div>
    </main>
  );
}
