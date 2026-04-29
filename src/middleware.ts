export { default } from "next-auth/middleware";

// Protege todo /admin/* exceto a página de login
export const config = {
  matcher: ["/admin/:path*"],
};
