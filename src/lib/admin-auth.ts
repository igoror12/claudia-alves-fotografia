import { getServerSession, type Session } from "next-auth";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

const ADMIN_ROLES = new Set(["ADMIN", "EDITOR"]);

function getRole(session: Session | null): string | undefined {
  return (session?.user as { role?: string } | undefined)?.role;
}

function isAuthorizedRole(role: string | undefined): boolean {
  return !!role && ADMIN_ROLES.has(role);
}

/**
 * Para route handlers (API). Se não autorizado, devolve uma Response 401.
 * Caller deve devolver `response` se não for null.
 */
export async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  const role = getRole(session);

  if (!session?.user || !isAuthorizedRole(role)) {
    return {
      session: null,
      response: NextResponse.json({ error: "Não autorizado." }, { status: 401 }),
    };
  }

  return { session, response: null };
}

/**
 * Para server pages (page.tsx). Redireciona para /admin/login se não autorizado.
 * Defesa em camadas: o middleware já protege, mas chamar isto em cada admin
 * page garante que mesmo se o middleware falhar, dados sensíveis nunca são
 * renderizados a utilizadores não-autenticados.
 *
 * Não chamar em /admin/login — daria loop infinito de redirects.
 */
export async function requireAdminPage(): Promise<{
  session: Session;
  role: string;
}> {
  const session = await getServerSession(authOptions);
  const role = getRole(session);

  if (!session?.user || !isAuthorizedRole(role)) {
    redirect("/admin/login");
  }

  return { session, role: role! };
}
