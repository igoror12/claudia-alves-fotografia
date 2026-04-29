import { ImageResponse } from "next/og";

// Next 14 file convention: gera automaticamente a OG image em
// /opengraph-image e inclui-a nos meta tags do layout. 1200x630 é o
// tamanho recomendado pelo Facebook/LinkedIn e funciona bem no X/Twitter.

export const runtime = "edge";
export const alt = "Cláudia Alves Fotografia · Braga, Portugal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#FAF8F4",
          padding: "80px 96px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            fontSize: 22,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: "#9E8E7E",
          }}
        >
          Cláudia Alves · Fotografia
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 96,
              lineHeight: 1.05,
              color: "#2E2820",
              fontWeight: 300,
              maxWidth: 900,
            }}
          >
            Retratos, casamentos
            <br />
            <span style={{ fontStyle: "italic", color: "#C9A882" }}>
              e eventos em Braga
            </span>
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#9E8E7E",
              maxWidth: 800,
              lineHeight: 1.4,
            }}
          >
            Fotografia de arte e memória — cada momento é eterno quando
            fotografado.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 20,
            color: "#9E8E7E",
            letterSpacing: 4,
            textTransform: "uppercase",
          }}
        >
          <span>claudiaalves.pt</span>
          <span>Braga · Portugal</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
