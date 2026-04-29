"use client";

import { useEffect } from "react";

// Aplica a classe .visible nos elementos .reveal e .gallery-item quando entram
// no viewport. Mantém o efeito do prototipo sem precisar de framer-motion.
export function Reveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { threshold: 0.1 }
    );

    document
      .querySelectorAll(".reveal, .gallery-item")
      .forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return null;
}
