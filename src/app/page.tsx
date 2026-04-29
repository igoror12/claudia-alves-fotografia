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

// Revalida a homepage de 10 em 10 minutos para puxar fotos novas
// sem precisar de redeploy. Compromisso entre frescura e cache.
export const revalidate = 600;

export default async function HomePage() {
  // Busca em paralelo: hero featured + galeria + posts recentes
  const [featured, gallery, posts, categories] = await Promise.all([
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
  ]);

  return (
    <>
      <Cursor />
      <Reveal />
      <Nav />
      <Hero featured={featured} />
      <Marquee />
      <Gallery photos={gallery} categories={categories} />
      <About />
      <Services />
      <Blog posts={posts} />
      <Contact />
      <Footer />
    </>
  );
}
