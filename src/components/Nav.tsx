"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * Nav scroll-aware: no topo é transparente com gradiente cream → fade.
 * Após scroll > 80px torna-se sólida com blur (padrão das revistas
 * editoriais premium tipo Aperture, Magnum).
 *
 * O threshold de 80px é deliberadamente baixo — assim que o utilizador
 * começa a explorar a página, a nav consolida-se e fica legível.
 */
export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll(); // estado inicial (caso entre num scroll-restore)
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`nav-bar flex justify-between items-center px-6 sm:px-12 ${
        scrolled ? "py-4 sm:py-5 scrolled" : "py-6 sm:py-8"
      }`}
    >
      <Link
        href="/"
        className="font-serif text-xl font-light tracking-[0.06em] text-ink"
      >
        Cláudia Alves <span className="italic text-accent">Fotografia</span>
      </Link>
      <ul className="hidden md:flex gap-10 list-none">
        {[
          ["Portfolio", "#portfolio"],
          ["Sobre", "#about"],
          ["Serviços", "#services"],
          ["Blog", "#blog"],
          ["Contacto", "#contact"],
        ].map(([label, href]) => (
          <li key={href}>
            <a href={href} className="nav-link">
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
