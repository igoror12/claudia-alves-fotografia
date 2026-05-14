import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Figtree } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "@/styles/globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://claudialvesfotografia.pt";

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
    default: "Fotógrafa em Braga · Cláudia Alves",
    template: "%s · Cláudia Alves Fotografia",
  },
  description:
    "Sessões de retrato, branding e eventos em Braga. Fotografia natural, cuidada e profissional. Vê o portfólio e agenda a tua sessão.",
  keywords: [
    "fotografia Braga",
    "fotógrafa branding Braga",
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
      "Fotografia de retratos, branding e eventos em Braga, Portugal.",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  alternates: { canonical: siteUrl },
};

export const viewport: Viewport = {
  themeColor: "#FAF8F4",
  width: "device-width",
  initialScale: 1,
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": `${siteUrl}/#business`,
  name: "Cláudia Alves Fotografia",
  description:
    "Fotografia de retratos, branding e eventos em Braga, Portugal.",
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
  serviceType: ["Retratos", "Fotografia de branding", "Eventos"],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Serviços de fotografia",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Retratos" },
      },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Branding" },
      },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Eventos" },
      },
    ],
  },
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
      <body className="font-sans">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
