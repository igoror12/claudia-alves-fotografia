import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Marquee } from "@/components/Marquee";
import { Gallery } from "@/components/Gallery";
import { About } from "@/components/About";
import { Services } from "@/components/Services";
import { Blog } from "@/components/Blog";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { Cursor } from "@/components/Cursor";
import { Reveal } from "@/components/Reveal";
import { Divider } from "@/components/Divider";

// Revalida a homepage de 10 em 10 minutos para puxar fotos novas
// sem precisar de redeploy. Compromisso entre frescura e cache.
export const revalidate = 600;

// Tipos derivados das chamadas Prisma — necessários porque envolvemos
// em try/catch com fallback [], o que perderia o tipo se não anotássemos.
type PhotoWithCat = Prisma.PhotoGetPayload<{ include: { category: true } }>;
type Post = Prisma.BlogPostGetPayload<object>;
type Cat = Prisma.CategoryGetPayload<object>;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error(`${label} excedeu ${ms}ms`)),
      ms
    );

    promise.then(
      (value) => {
        clearTimeout(timeout);
        resolve(value);
      },
      (error) => {
        clearTimeout(timeout);
        reject(error);
      }
    );
  });
}

/**
 * Busca os dados da homepage tolerando DB vazia ou inexistente.
 *
 * Porquê este wrapper:
 * - Vercel faz o primeiro build ANTES do `prisma db push` correr → tabelas
 *   ainda não existem, prerender de `/` rebenta.
 * - Em vez de bloquear o deploy, devolvemos arrays vazios e os componentes
 *   renderizam estado "sem conteúdo". Após o seed, o ISR (10min) puxa os
 *   dados reais sem novo deploy.
 */
async function safeFetchHomeData(): Promise<{
  featured: PhotoWithCat[];
  gallery: PhotoWithCat[];
  posts: Post[];
  categories: Cat[];
}> {
  try {
    const [featured, gallery, posts, categories] = await withTimeout(
      Promise.all([
        prisma.photo.findMany({
          where: { featured: true, published: true },
          orderBy: { order: "asc" },
          take: 3,
          include: { category: true },
        }),
        prisma.photo.findMany({
          where: { published: true },
          orderBy: [{ order: "asc" }, { createdAt: "desc" }],
          take: 6,
          include: { category: true },
        }),
        prisma.blogPost.findMany({
          where: { published: true },
          orderBy: { publishedAt: "desc" },
          take: 3,
        }),
        prisma.category.findMany({ orderBy: { order: "asc" } }),
      ]),
      2500,
      "homepage DB fetch"
    );
    return { featured, gallery, posts, categories };
  } catch (e) {
    // DB ainda não migrada / unreachable. Log para debug e fallback vazio.
    console.warn("[homepage] DB indisponível, a renderizar com fallback vazio:", e);
    return { featured: [], gallery: [], posts: [], categories: [] };
  }
}

export default async function HomePage() {
  const { featured, gallery, posts, categories } = await safeFetchHomeData();

  // O Hero precisa sempre de 3 fotos para preencher o lado direito.
  // Se a Cláudia ainda não marcou 3 como Destaque, completamos
  // automaticamente com outras fotos publicadas (sem duplicar).
  const heroPhotos = (() => {
    if (featured.length >= 3) return featured.slice(0, 3);
    const seen = new Set(featured.map((p) => p.id));
    const extras = gallery.filter((p) => !seen.has(p.id));
    return [...featured, ...extras].slice(0, 3);
  })();

  return (
    <>
      <Cursor />
      <Reveal />
      <Nav />
      <Hero featured={heroPhotos} />
      <Marquee />
      <Gallery photos={gallery} categories={categories} />
      <Divider />
      <About />
      <Divider />
      <Services />
      <Divider />
      <Blog posts={posts} />
      <Contact />
      <Footer />
    </>
  );
}
