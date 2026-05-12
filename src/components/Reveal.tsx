"use client";

import { useEffect } from "react";

const REVEAL_SELECTOR =
  ".reveal:not(.visible), .reveal-scale:not(.visible), .reveal-clip:not(.visible), .reveal-left:not(.visible), .reveal-right:not(.visible), .section-divider:not(.visible), .gallery-item:not(.visible)";

export function Reveal() {
  useEffect(() => {
    const revealElements = () =>
      document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR);

    const revealAll = () => {
      revealElements().forEach((el) => el.classList.add("visible"));
    };

    if (
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      revealAll();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
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
