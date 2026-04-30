import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

const PatchSchema = z.object({
  status: z.enum(["NEW", "REPLIED", "BOOKED", "ARCHIVED"]).optional(),
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
  const message = await prisma.contactRequest.update({
    where: { id: params.id },
    data,
  });
  return NextResponse.json({ message });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { response } = await requireAdminSession();
  if (response) return response;
  await prisma.contactRequest.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
