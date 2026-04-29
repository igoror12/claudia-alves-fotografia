import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { processAndUploadPhoto } from "@/lib/image-pipeline";
import { generatePhotoMetadata, categorizePhoto } from "@/lib/ai";

// Aumenta o limite de body. Originais de fotografia profissional rondam
// 5-15MB, vamos dar margem confortável até 25MB.
export const maxDuration = 60;
export const runtime = "nodejs";

const PostSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  altText: z.string().optional(),
  featured: z.coerce.boolean().optional(),
});

/**
 * POST /api/admin/photos
 * multipart/form-data com:
 *   - file: a imagem (obrigatório)
 *   - title, description, categoryId, altText, featured (opcionais)
 *
 * Pipeline:
 * 1. Auth check (admin obrigatório)
 * 2. Sharp gera 3 variantes WebP + blur placeholder + uploads para Blob
 * 3. Claude Vision gera alt-text/SEO/categoria se faltarem campos
 * 4. Persiste no Postgres
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Ficheiro em falta." }, { status: 400 });
  }
  if (file.size > 25 * 1024 * 1024) {
    return NextResponse.json(
      { error: "Imagem demasiado grande (máx 25MB)." },
      { status: 413 }
    );
  }

  const fields = PostSchema.parse(Object.fromEntries(form.entries()));
  const buffer = Buffer.from(await file.arrayBuffer());

  // 1. Processa e faz upload das variantes
  const processed = await processAndUploadPhoto(buffer, file.name);

  // 2. IA preenche o que faltar (paralelo com upload já feito)
  let altText = fields.altText;
  let categoryId = fields.categoryId;
  let keywords: string[] = [];

  if (!altText || !categoryId) {
    const [meta, autoCategory] = await Promise.all([
      generatePhotoMetadata(processed.mediumUrl, fields.title),
      categoryId
        ? null
        : categorizePhoto(processed.mediumUrl).then(async (slug) => {
            const cat = await prisma.category.findUnique({ where: { slug } });
            return cat?.id;
          }),
    ]);

    altText = altText ?? meta.altText;
    keywords = meta.keywords;
    categoryId = categoryId ?? autoCategory ?? undefined;
  }

  if (!categoryId) {
    // Fallback: primeira categoria por ordem
    const first = await prisma.category.findFirst({ orderBy: { order: "asc" } });
    if (!first) {
      return NextResponse.json(
        { error: "Sem categorias na base de dados. Corre `npm run db:seed`." },
        { status: 500 }
      );
    }
    categoryId = first.id;
  }

  // 3. Persiste no Postgres
  const photo = await prisma.photo.create({
    data: {
      thumbUrl: processed.thumbUrl,
      mediumUrl: processed.mediumUrl,
      fullUrl: processed.fullUrl,
      originalUrl: processed.originalUrl,
      blurDataUrl: processed.blurDataUrl,
      width: processed.width,
      height: processed.height,
      title: fields.title,
      description: fields.description,
      altText: altText ?? "Fotografia por Cláudia Alves",
      keywords,
      categoryId,
      featured: fields.featured ?? false,
      exifCamera: processed.exif.camera,
      exifLens: processed.exif.lens,
      exifSettings: processed.exif.settings,
      shotAt: processed.exif.shotAt,
    },
    include: { category: true },
  });

  return NextResponse.json({ photo });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const photos = await prisma.photo.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    include: { category: true },
  });
  return NextResponse.json({ photos });
}
