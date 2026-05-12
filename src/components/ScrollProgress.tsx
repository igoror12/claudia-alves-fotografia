"use client";

import { useEffect, useState } from "react";

/**
 * Riel de progresso lateral — fixed no lado direito do viewport.
 *
 * Detecção da secção ativa via IntersectionObserver com rootMargin que
 * privilegia o centro da janela (evita "saltar" entre secções quando
 * duas são parcialmente visíveis).
 *
 * Cor adaptativa: cada secção pode ter um tema light/dark (definido em
 * SECTIONS). O componente aplica a cor apropriada para se destacar contra
 * o fundo dessa secção.
 *
 * Esconde-se durante o Hero (primeiros 50vh) para não competir com a
 * entrada cinematográfica.
 *
 * Desativado em mobile (lg+ apenas) — em ecrãs pequenos rouba espaço útil.
 */
const SECTIONS = [
  { id: "portfolio", label: "Portfolio", theme: "light" as const },
  { id: "about", label: "Sobre", theme: "dark" as const },
  { id: "services", label: "Serviços", theme: "light" as const },
  { id: "blog", label: "Blog", theme: "light" as const },
  { id: "contact", label: "Contacto", theme: "light" as const },
];

type Theme = "light" | "dark";

export function ScrollProgress() {
  const [activeId, setActiveId] = useState<string>("");
  const [activeTheme, setActiveTheme] = useState<Theme>("light");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Esconde até passar do hero (~50vh)
    function onScroll() {
      setVisible(window.scrollY > window.innerHeight * 0.5);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // IntersectionObserver: dispara quando uma secção ocupa a faixa central
    // (rootMargin negativo top e bottom = só conta o middle 60% do viewport).
    const observer = new IntersectionObserver(
      (entries) => {
        // Para evitar oscilação quando duas secções coexistem na faixa,
        // ordenamos as ativas pela posição no documento e ficamos com a 1ª.
        const intersecting = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => {
            const aTop = a.target.getBoundingClientRect().top;
            const bTop = b.target.getBoundingClientRect().top;
            return aTop - bTop;
          });

        if (intersecting.length > 0) {
          const id = intersecting[0].target.id;
          setActiveId(id);
          const meta = SECTIONS.find((s) => s.id === id);
          if (meta) setActiveTheme(meta.theme);
        }
      },
      {
        threshold: 0,
        rootMargin: "-30% 0px -50% 0px",
      }
    );

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);

  // Cores que se destacam contra cada tema
  const baseColor =
    activeTheme === "dark" ? "rgba(250,248,244,0.35)" : "rgba(46,40,32,0.25)";
  const labelColor =
    activeTheme === "dark" ? "rgba(250,248,244,0.7)" : "rgba(46,40,32,0.6)";

  return (
    <aside
      aria-label="Navegação por secções"
      className={`fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-5 transition-opacity duration-500 ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      {SECTIONS.map(({ id, label }) => {
        const isActive = activeId === id;
        return (
          <a
            key={id}
            href={`#${id}`}
            aria-label={`Ir para ${label}`}
            aria-current={isActive ? "true" : undefined}
            className="group relative flex items-center justify-end gap-3 py-1"
          >
            <span
              className="text-[0.6rem] uppercase tracking-[0.28em] whitespace-nowrap opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{ color: isActive ? "var(--accent)" : labelColor }}
            >
              {label}
            </span>
            <span
              className="block h-px transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{
                width: isActive ? "36px" : "20px",
                background: isActive ? "var(--accent)" : baseColor,
              }}
            />
          </a>
        );
      })}
    </aside>
  );
}
