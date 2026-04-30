import Link from "next/link";

export function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] flex justify-between items-center px-12 py-8 before:absolute before:inset-0 before:bg-gradient-to-b before:from-cream/95 before:to-transparent before:pointer-events-none">
      <Link
        href="/"
        className="relative z-[1] font-serif text-xl font-light tracking-[0.06em] text-ink"
      >
        Cláudia Alves <span className="italic text-accent">Fotografia</span>
      </Link>
      <ul className="relative z-[1] hidden md:flex gap-10 list-none">
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
