import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://claudiaalves.pt";

// Revalida o sitemap a cada hora — equilibra frescura e custo de DB.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Em build sem DB definido (ex: preview vazio), apanhamos a falha
  // e devolvemos só as rotas estáticas — evita rebentar o build.
  let blogSlugs: { slug: string; updatedAt: Date }[] = [];
  let categorySlugs: { slug: string }[] = [];
  try {
    [blogSlugs, categorySlugs] = await Promise.all([
      prisma.blogPost.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.category.findMany({ select: { slug: true } }),
    ]);
  } catch {
    // sem DB ou ainda não populada — segue só com estáticas
  }

  const now = new Date();

  return [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 1,
    },
    ...categorySlugs.map((c) => ({
      url: `${BASE_URL}/galeria/${c.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...blogSlugs.map((p) => ({
      url: `${BASE_URL}/blog/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
