import { withAuth } from "next-auth/middleware";

/**
 * Protege /admin/* exceto a própria página de login.
 *
 * Porquê este padrão (e não `export { default } from "next-auth/middleware"`):
 * O matcher "/admin/:path*" capta também "/admin/login". Quando o utilizador
 * não está autenticado, o NextAuth redireciona para a página signIn (que é
 * /admin/login) — mas como essa página está no matcher, é interceptada outra
 * vez, voltando a redirecionar para /admin/login… loop infinito → o browser
 * aborta com ERR_TOO_MANY_REDIRECTS.
 *
 * O callback `authorized` deixa /admin/login passar SEMPRE (autorizado=true
 * para qualquer request, mesmo sem token), bloqueando só as outras rotas.
 */
export default withAuth({
  pages: { signIn: "/admin/login" },
  callbacks: {
    authorized: ({ token, req }) => {
      // /admin/login é público — sem isto entramos em loop
      if (req.nextUrl.pathname === "/admin/login") return true;
      // Restantes rotas /admin/* exigem sessão válida
      return token?.role === "ADMIN" || token?.role === "EDITOR";
    },
  },
});

export const config = {
  matcher: ["/admin/:path*"],
};
