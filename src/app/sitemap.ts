import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://claudia-alves.pt";

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

    routes.push(
      ...categories.map((category) => ({
        url: `${BASE_URL}/galeria/${category.slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }))
    );
  } catch {
    // Se a DB estiver indisponível no build/deploy, mantemos o sitemap estático.
  }

  return routes;
}
