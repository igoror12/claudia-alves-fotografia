"use client";

import { useEffect } from "react";

// Aplica a classe .visible nos elementos .reveal e .gallery-item quando entram
// no viewport. Mantém o efeito do prototipo sem precisar de framer-motion.
export function Reveal() {
  useEffect(() => {
    const revealElements = () =>
      document.querySelectorAll<HTMLElement>(
        ".reveal:not(.visible), .reveal-scale:not(.visible), .reveal-clip:not(.visible)"
      );

    if (!("IntersectionObserver" in window)) {
      revealElements().forEach((el) => el.classList.add("visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            observer.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    revealElements().forEach((el) => observer.observe(el));

    const mutationObserver = new MutationObserver(() => {
      revealElements().forEach((el) => observer.observe(el));
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return null;
}
