import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { del } from "@vercel/blob";

const PatchSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  altText: z.string().optional(),
  categoryId: z.string().optional(),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
  order: z.number().int().optional(),
  keywords: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { response } = await requireAdminSession();
  if (response) return response;

  const parsed = PatchSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Pedido invalido." },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const photo = await prisma.photo.update({ where: { id: params.id }, data });

  // Invalida o cache ISR da homepage e da galeria — as alterações
  // (publicar/despublicar/destacar/editar) refletem-se imediatamente em vez
  // de esperar pelos 10 min do `revalidate`.
  revalidatePath("/");

  return NextResponse.json({ photo });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { response } = await requireAdminSession();
  if (response) return response;

  const photo = await prisma.photo.findUnique({ where: { id: params.id } });
  if (!photo) return NextResponse.json({ ok: true });

  // Limpeza no Blob (best-effort — não falha o delete se blob já não existir)
  await Promise.allSettled([
    del(photo.thumbUrl),
    del(photo.mediumUrl),
    del(photo.fullUrl),
    photo.originalUrl ? del(photo.originalUrl) : Promise.resolve(),
  ]);

  await prisma.photo.delete({ where: { id: params.id } });
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
