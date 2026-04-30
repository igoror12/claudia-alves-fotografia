import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

const ADMIN_ROLES = new Set(["ADMIN", "EDITOR"]);

export async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!session?.user || !role || !ADMIN_ROLES.has(role)) {
    return {
      session: null,
      response: NextResponse.json({ error: "Nao autorizado." }, { status: 401 }),
    };
  }

  return { session, response: null };
}
