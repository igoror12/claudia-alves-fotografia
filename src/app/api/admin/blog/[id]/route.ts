import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

const PatchSchema = z.object({
  title: z.string().trim().min(2).max(200).optional(),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  excerpt: z.string().trim().min(10).max(500).optional(),
  content: z.string().trim().min(10).optional(),
  coverUrl: z.string().url().nullable().optional(),
  category: z.string().trim().min(2).max(50).optional(),
  metaTitle: z.string().nullable().optional(),
  metaDesc: z.string().max(200).nullable().optional(),
  published: z.boolean().optional(),
  publishedAt: z.string().datetime().nullable().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { response } = await requireAdminSession();
  if (response) return response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Pedido inválido." },
      { status: 400 }
    );
  }

  // Se mudaram o slug, validar unicidade
  if (parsed.data.slug) {
    const conflict = await prisma.blogPost.findFirst({
      where: { slug: parsed.data.slug, NOT: { id: params.id } },
    });
    if (conflict) {
      return NextResponse.json(
        { error: "Já existe outro post com esse slug." },
        { status: 409 }
      );
    }
  }

  const data: Parameters<typeof prisma.blogPost.update>[0]["data"] = {
    ...parsed.data,
  };
  if (parsed.data.publishedAt !== undefined) {
    data.publishedAt = parsed.data.publishedAt
      ? new Date(parsed.data.publishedAt)
      : null;
  }

  const post = await prisma.blogPost.update({
    where: { id: params.id },
    data,
  });

  // Invalida o cache da homepage (secção blog) imediatamente.
  revalidatePath("/");

  return NextResponse.json({ post });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { response } = await requireAdminSession();
  if (response) return response;
  await prisma.blogPost.delete({ where: { id: params.id } });
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
