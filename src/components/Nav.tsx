"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const LINKS = [
  ["Portfolio", "/#portfolio"],
  ["Galeria", "/galeria"],
  ["Sobre", "/#about"],
  ["Serviços", "/#services"],
  ["Blog", "/blog"],
  ["Contacto", "/#contact"],
] as const;

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <nav
      className={`nav-bar px-6 sm:px-12 ${
        scrolled ? "py-3 sm:py-4 scrolled" : "py-4 sm:py-5"
      }`}
      aria-label="Navegação principal"
    >
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="font-serif text-xl font-light tracking-[0.06em] text-ink"
          onClick={() => setOpen(false)}
        >
          Cláudia Alves <span className="italic text-accent">Fotografia</span>
        </Link>

        <ul className="hidden md:flex gap-10 list-none">
          {LINKS.map(([label, href]) => (
            <li key={href}>
              <Link href={href} className="nav-link">
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="md:hidden text-[0.72rem] uppercase tracking-[0.18em] text-ink border border-warm-light px-4 py-2"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Fechar" : "Menu"}
        </button>
      </div>

      {open && (
        <div
          id="mobile-nav"
          className="md:hidden mt-5 border-t border-warm-light bg-cream/95 pt-3"
        >
          {LINKS.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="block py-3 text-[0.78rem] uppercase tracking-[0.16em] text-warm-mid hover:text-ink"
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
