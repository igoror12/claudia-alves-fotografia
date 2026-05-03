import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Figtree } from "next/font/google";
import "@/styles/globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://claudiaalves.pt";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["300", "400"],
  style: ["normal", "italic"],
  display: "swap",
});

const sans = Figtree({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Cláudia Alves Fotografia · Retratos, Casamentos e Eventos em Braga",
    template: "%s · Cláudia Alves Fotografia",
  },
  description:
    "Fotografia de arte e memória em Braga, Portugal. Especialista em retratos, casamentos e eventos. Cada momento é eterno quando fotografado.",
  keywords: [
    "fotografia Braga",
    "fotógrafa casamento Portugal",
    "retratos Braga",
    "fotografia eventos norte Portugal",
    "Cláudia Alves",
  ],
  openGraph: {
    type: "website",
    locale: "pt_PT",
    siteName: "Cláudia Alves Fotografia",
    title: "Cláudia Alves Fotografia",
    description:
      "Fotografia de retratos, casamentos e eventos em Braga, Portugal.",
    // OG image gerada dinamicamente em src/app/opengraph-image.tsx
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  alternates: { canonical: "https://claudiaalves.pt" },
};

export const viewport: Viewport = {
  themeColor: "#FAF8F4",
  width: "device-width",
  initialScale: 1,
};

/**
 * Structured data Schema.org — informa o Google que este é um negócio
 * local de fotografia em Braga. Permite rich results (mapa, telefone,
 * preço-range) nos resultados de pesquisa.
 *
 * Atualizar `priceRange` e contactos se mudarem.
 */
const structuredData = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": `${siteUrl}/#business`,
  name: "Cláudia Alves Fotografia",
  description:
    "Fotografia de retratos, casamentos e eventos em Braga, Portugal.",
  url: siteUrl,
  image: `${siteUrl}/opengraph-image`,
  priceRange: "€€",
  telephone: "+351938944545",
  email: "claudialvesfotografia@gmail.com",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Braga",
    addressRegion: "Braga",
    addressCountry: "PT",
  },
  areaServed: { "@type": "Country", name: "Portugal" },
  sameAs: ["https://instagram.com/claudialvesfotografia"],
  serviceType: ["Fotografia de casamento", "Retratos", "Eventos"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT" className={`${serif.variable} ${sans.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}
