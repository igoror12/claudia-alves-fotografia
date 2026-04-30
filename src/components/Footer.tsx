import { Instagram, Camera, Sparkles } from "lucide-react";

/**
 * Footer com ícones lucide. Cada link sobe 3px no hover + cor accent.
 * Mantém o tipo "Cláudia Alves Fotografia" na esquerda e copyright no centro.
 */
const SOCIAL = [
  { label: "Instagram", href: "https://instagram.com/claudiaalvesfoto", Icon: Instagram },
  { label: "Pinterest", href: "#", Icon: Sparkles },
  { label: "Behance", href: "#", Icon: Camera },
];

export function Footer() {
  return (
    <footer className="bg-section-dark px-6 py-10 sm:px-12 sm:py-12 flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="font-serif text-lg font-light text-cream tracking-[0.06em]">
        Cláudia Alves <span className="italic text-accent">Fotografia</span>
      </div>
      <div className="text-[0.7rem] tracking-[0.1em] text-cream/30">
        © {new Date().getFullYear()} Cláudia Alves Fotografia. Todos os direitos
        reservados.
      </div>
      <div className="flex gap-6">
        {SOCIAL.map(({ label, href, Icon }) => (
          <a
            key={label}
            href={href}
            className="footer-link text-[0.7rem] uppercase tracking-[0.15em]"
            target={href.startsWith("http") ? "_blank" : undefined}
            rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
            aria-label={label}
          >
            <Icon size={14} strokeWidth={1.5} />
            <span>{label}</span>
          </a>
        ))}
      </div>
    </footer>
  );
}
