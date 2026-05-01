import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { processAndUploadPhoto } from "@/lib/image-pipeline";
import { generatePhotoMetadata, categorizePhoto } from "@/lib/ai";

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
 * Helper para apanhar erros por estágio. Devolve resposta JSON com a etapa
 * onde falhou, mensagem human-readable e o stack para os runtime logs do
 * Vercel. Sem isto, o uploader só vê "erro" sem contexto.
 */
async function runStage<T>(
  stage: string,
  fn: () => Promise<T>
): Promise<T | { __stageError: { stage: string; message: string } }> {
  try {
    return await fn();
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error(`[upload:${stage}]`, e); // visível em vercel logs
    return { __stageError: { stage, message } };
  }
}

function isStageError(
  v: unknown
): v is { __stageError: { stage: string; message: string } } {
  return (
    typeof v === "object" &&
    v !== null &&
    "__stageError" in v &&
    typeof (v as { __stageError?: unknown }).__stageError === "object"
  );
}

export async function POST(req: NextRequest) {
  const { response } = await requireAdminSession();
  if (response) return response;

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Ficheiro em falta." }, { status: 400 });
  }
  if (file.size > 25 * 1024 * 1024) {
    return NextResponse.json(
      {
        error: `Imagem demasiado grande (${(file.size / 1024 / 1024).toFixed(1)}MB, máx 25MB).`,
      },
      { status: 413 }
    );
  }

  const parsed = PostSchema.safeParse(Object.fromEntries(form.entries()));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Pedido inválido." },
      { status: 400 }
    );
  }
  const fields = parsed.data;
  const buffer = Buffer.from(await file.arrayBuffer());

  // ─── 1. Sharp + Vercel Blob ─────────────────────────────────────
  const processed = await runStage("sharp+blob", () =>
    processAndUploadPhoto(buffer, file.name)
  );
  if (isStageError(processed)) {
    return NextResponse.json(
      {
        error: `Falha ao processar imagem (${processed.__stageError.stage}): ${processed.__stageError.message}. Verifica BLOB_READ_WRITE_TOKEN nas envs.`,
        stage: processed.__stageError.stage,
      },
      { status: 500 }
    );
  }

  // ─── 2. Claude Vision (alt-text + categoria) — best-effort ──────
  // Se falhar, NÃO bloqueia o upload. A foto ainda fica guardada com
  // alt-text fallback, e a admin pode editar depois manualmente.
  let altText = fields.altText;
  let categoryId = fields.categoryId;
  let keywords: string[] = [];
  let aiWarning: string | null = null;

  if (!altText || !categoryId) {
    const meta = await runStage("claude-meta", () =>
      generatePhotoMetadata(processed.mediumUrl, fields.title)
    );
    if (isStageError(meta)) {
      aiWarning = `Claude Vision falhou (${meta.__stageError.message}). Foto guardada com alt-text genérico. Verifica ANTHROPIC_API_KEY.`;
    } else {
      altText = altText ?? meta.altText;
      keywords = meta.keywords;
    }

    if (!categoryId) {
      const slug = await runStage("claude-category", () =>
        categorizePhoto(processed.mediumUrl)
      );
      if (!isStageError(slug)) {
        const cat = await prisma.category.findUnique({ where: { slug } });
        categoryId = cat?.id;
      }
    }
  }

  // ─── 3. Fallback de categoria ───────────────────────────────────
  if (!categoryId) {
    const first = await prisma.category.findFirst({ orderBy: { order: "asc" } });
    if (!first) {
      return NextResponse.json(
        {
          error:
            "Sem categorias na base de dados. Corre `npm run db:seed` localmente.",
          stage: "category-fallback",
        },
        { status: 500 }
      );
    }
    categoryId = first.id;
  }

  // ─── 4. Persiste no Postgres ────────────────────────────────────
  const created = await runStage("prisma-create", () =>
    prisma.photo.create({
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
        categoryId: categoryId!,
        featured: fields.featured ?? false,
        exifCamera: processed.exif.camera,
        exifLens: processed.exif.lens,
        exifSettings: processed.exif.settings,
        shotAt: processed.exif.shotAt,
      },
      include: { category: true },
    })
  );
  if (isStageError(created)) {
    return NextResponse.json(
      {
        error: `Erro a guardar na DB: ${created.__stageError.message}`,
        stage: created.__stageError.stage,
      },
      { status: 500 }
    );
  }

  // Invalida o cache da homepage para a foto nova aparecer já,
  // sem esperar pelos 10 min do revalidate.
  revalidatePath("/");

  return NextResponse.json({ photo: created, warning: aiWarning });
}

export async function GET() {
  const { response } = await requireAdminSession();
  if (response) return response;

  const photos = await prisma.photo.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    include: { category: true },
  });
  return NextResponse.json({ photos });
}
