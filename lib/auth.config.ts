import type { NextAuthConfig } from "next-auth";

// Minimal config safe for Edge runtime (no Prisma, no nodemailer)
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
    verifyRequest: "/verify",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isPublicPath =
        nextUrl.pathname.startsWith("/e/") ||
        nextUrl.pathname.startsWith("/login") ||
        nextUrl.pathname.startsWith("/verify") ||
        nextUrl.pathname.startsWith("/api/auth");

      if (isPublicPath) return true;
      return isLoggedIn;
    },
    session({ session, token }) {
      if (token?.sub) session.user.id = token.sub;
      return session;
    },
  },
  providers: [],
  session: { strategy: "jwt" },
};
