import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const data = PatchSchema.parse(await req.json());
  const photo = await prisma.photo.update({ where: { id: params.id }, data });
  return NextResponse.json({ photo });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

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
  return NextResponse.json({ ok: true });
}
