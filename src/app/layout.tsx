import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Figtree } from "next/font/google";
import "@/styles/globals.css";

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT" className={`${serif.variable} ${sans.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
