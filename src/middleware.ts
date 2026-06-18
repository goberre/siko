import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

/** callbackUrl이 동일 오리진인지 검사 (오픈 리다이렉트 방어) */
function safeCallbackUrl(url: string | null, base: URL): string {
  if (!url) return "/";
  try {
    const parsed = new URL(url, base.origin);
    // 같은 오리진이 아니면 홈으로
    if (parsed.origin !== base.origin) return "/";
    return parsed.pathname + parsed.search;
  } catch {
    if (url.startsWith("/") && !url.startsWith("//")) return url;
    return "/";
  }
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session    = req.auth;
  const isLoggedIn = !!session;
  const role       = (session?.user as { role?: string })?.role ?? "user";

  // 어드민 보호
  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      const url = new URL("/login", req.url);
      url.searchParams.set("callbackUrl", pathname);
      return Response.redirect(url);
    }
    if (role !== "admin") {
      return Response.redirect(new URL("/", req.url));
    }
  }

  // 로그인 필요 페이지
  if (
    (pathname.startsWith("/cart") || pathname.startsWith("/dashboard") || pathname.startsWith("/mypage")) &&
    !isLoggedIn
  ) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return Response.redirect(url);
  }

  // 이미 로그인된 경우 인증 페이지 접근 차단 + callbackUrl 검증 후 리다이렉트
  if ((pathname === "/login" || pathname === "/register" || pathname === "/forgot-password") && isLoggedIn) {
    const cb = req.nextUrl.searchParams.get("callbackUrl");
    const safe = safeCallbackUrl(cb, req.nextUrl);
    return Response.redirect(new URL(safe, req.url));
  }
});

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/cart",
    "/cart/:path*",
    "/dashboard",
    "/dashboard/:path*",
    "/mypage",
    "/mypage/:path*",
    "/login",
    "/register",
    "/forgot-password",
  ],
};
