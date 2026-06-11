import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, LIMITS } from "@/lib/rateLimit";

/**
 * 로그인 전 계정 상태 사전 확인 API
 * 실제 인증은 NextAuth Credentials provider가 수행하지만,
 * 잠금 상태 같은 세분화된 메시지를 클라이언트에 전달하기 위해 사용.
 */
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  // IP Rate Limit
  const rl = checkRateLimit(`login:${ip}`, LIMITS.LOGIN);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "RATE_LIMITED", message: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
      { status: 429 }
    );
  }

  try {
    const { email } = await req.json().catch(() => ({ email: "" }));
    if (!email) return NextResponse.json({ ok: true });

    const user = await prisma.user.findUnique({
      where: { email },
      select: { lockedUntil: true, loginAttempts: true },
    });

    if (!user) return NextResponse.json({ ok: true }); // 존재 여부 노출 금지

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const mins = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60_000);
      return NextResponse.json({
        error:   "ACCOUNT_LOCKED",
        message: `보안을 위해 계정이 잠겼습니다. ${mins}분 후 다시 시도해주세요.`,
        lockedFor: mins,
      });
    }

    const remaining = 5 - user.loginAttempts;
    return NextResponse.json({ ok: true, attemptsRemaining: remaining > 0 ? remaining : 0 });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
