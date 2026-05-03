import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/admin-auth";
import { PhotoUploader } from "@/components/admin/PhotoUploader";
import { PhotoGrid } from "@/components/admin/PhotoGrid";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  await requireAdminPage();

  const [photos, categories] = await Promise.all([
    prisma.photo.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      include: { category: true },
    }),
    prisma.category.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="font-serif text-4xl font-light text-ink mb-8">
        Galeria <em className="italic text-accent">— gestão de fotografias</em>
      </h1>

      <PhotoUploader categories={categories} />

      <div className="mt-12">
        <h2 className="font-serif text-2xl text-ink mb-4">
          Fotos publicadas ({photos.length})
        </h2>
        <PhotoGrid photos={photos} />
      </div>
    </div>
  );
}
