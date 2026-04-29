"use client";

import { useEffect, useRef } from "react";

// Cursor custom (ponto sólido + ring delayed). Carregado lazy no client.
// Em mobile/touch é desligado via media query.
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) return;
    document.body.classList.add("cursor-active");

    let mx = 0, my = 0, rx = 0, ry = 0;

    function onMove(e: MouseEvent) {
      mx = e.clientX;
      my = e.clientY;
      if (dot.current) {
        dot.current.style.left = `${mx}px`;
        dot.current.style.top = `${my}px`;
      }
    }
    function loop() {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      if (ring.current) {
        ring.current.style.left = `${rx}px`;
        ring.current.style.top = `${ry}px`;
      }
      raf = requestAnimationFrame(loop);
    }
    let raf = requestAnimationFrame(loop);

    function onEnter() {
      if (dot.current) {
        dot.current.style.width = "14px";
        dot.current.style.height = "14px";
        dot.current.style.background = "#C9A882";
      }
      if (ring.current) {
        ring.current.style.width = "52px";
        ring.current.style.height = "52px";
        ring.current.style.borderColor = "rgba(201,168,130,0.5)";
      }
    }
    function onLeave() {
      if (dot.current) {
        dot.current.style.width = "8px";
        dot.current.style.height = "8px";
        dot.current.style.background = "#2E2820";
      }
      if (ring.current) {
        ring.current.style.width = "36px";
        ring.current.style.height = "36px";
        ring.current.style.borderColor = "rgba(46,40,32,0.3)";
      }
    }

    document.addEventListener("mousemove", onMove);
    const interactive = document.querySelectorAll(
      "a, button, .gallery-item, .service-card, .filter-btn, .blog-card"
    );
    interactive.forEach((el) => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    });

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("mousemove", onMove);
      interactive.forEach((el) => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      });
      document.body.classList.remove("cursor-active");
    };
  }, []);

  return (
    <>
      <div
        ref={dot}
        className="fixed w-2 h-2 bg-ink rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 transition-[width,height,background] duration-300"
      />
      <div
        ref={ring}
        className="fixed w-9 h-9 border border-ink/30 rounded-full pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 transition-[width,height,border-color] duration-300"
      />
    </>
  );
}
