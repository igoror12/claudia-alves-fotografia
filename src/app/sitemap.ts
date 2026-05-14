import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://claudialvesfotografia.pt";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const routes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/galeria`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  try {
    const categories = await prisma.category.findMany({
      select: { slug: true },
      orderBy: { order: "asc" },
    });
    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true, publishedAt: true },
      orderBy: { publishedAt: "desc" },
    });

    routes.push(
      ...categories.map((category) => ({
        url: `${BASE_URL}/galeria/${category.slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
      ...posts.map((post) => ({
        url: `${BASE_URL}/blog/${post.slug}`,
        lastModified: post.updatedAt ?? post.publishedAt ?? now,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }))
    );
  } catch {
    // Se a DB estiver indisponível no build/deploy, mantemos o sitemap estático.
  }

  return routes;
}
