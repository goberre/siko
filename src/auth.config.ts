import type { NextAuthConfig } from "next-auth";

/**
 * Edge-compatible auth config (no Prisma, no native modules).
 * Used by middleware only.
 */
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
    error:  "/login",
  },
  providers: [], // Credentials provider is added in auth.ts (server only)
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn  = !!auth?.user;
      const role        = (auth?.user as { role?: string })?.role ?? "user";
      const { pathname } = nextUrl;

      // 어드민 보호
      if (pathname.startsWith("/admin")) {
        return isLoggedIn && role === "admin";
      }
      // 보호된 유저 페이지
      if (pathname.startsWith("/cart") || pathname.startsWith("/mypage")) {
        return isLoggedIn;
      }
      // 이미 로그인된 경우 /login, /register 접근 차단
      if (pathname === "/login" || pathname === "/register") {
        return !isLoggedIn;
      }
      return true;
    },
  },
};
