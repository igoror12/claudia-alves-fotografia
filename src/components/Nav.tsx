import Link from "next/link";

export function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] flex justify-between items-center bg-cream/95 px-6 py-6 shadow-[0_1px_0_rgba(221,212,200,0.35)] backdrop-blur-sm sm:px-12 sm:py-8">
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
