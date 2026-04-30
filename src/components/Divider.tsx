/**
 * Linha hairline de 1px que se desenha de 0 → 100% quando entra no
 * viewport (via Reveal observer). Usar entre secções para criar
 * hierarquia visual subtil. Inset opcional para não tocar nas margens.
 */
type Props = {
  inset?: boolean;
  centered?: boolean;
};

export function Divider({ inset = true, centered = false }: Props) {
  return (
    <div
      aria-hidden="true"
      className={inset ? "px-12 sm:px-24" : ""}
    >
      <div
        className={`section-divider ${centered ? "center-origin" : ""}`}
      />
    </div>
  );
}
