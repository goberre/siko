import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimit";
import { writeAuditLog } from "@/lib/auditLog";
import { randomBytes } from "crypto";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  // Rate limit: 10분에 3회
  const rl = checkRateLimit(`forgot:${ip}`, { max: 3, windowMs: 10 * 60_000 });
  if (!rl.allowed) {
    // 존재 여부 노출 방지를 위해 성공처럼 응답
    return NextResponse.json({ ok: true });
  }

  const { email } = await req.json().catch(() => ({ email: "" }));
  if (!email || typeof email !== "string") {
    return NextResponse.json({ ok: true }); // 이메일 존재 여부 노출 금지
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    select: { id: true, name: true, email: true },
  });

  if (!user) {
    // 존재하지 않는 이메일이어도 같은 응답 (enum 공격 방어)
    return NextResponse.json({ ok: true });
  }

  // 기존 토큰 삭제
  await prisma.verificationToken.deleteMany({
    where: { identifier: `reset:${user.email}` },
  });

  // 새 토큰 생성 (1시간 유효)
  const token   = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60_000);

  await prisma.verificationToken.create({
    data: { identifier: `reset:${user.email}`, token, expires },
  });

  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;

  await writeAuditLog({ action: "PASSWORD_RESET_REQUEST", userId: user.id, ip });

  // TODO: 이메일 발송 (Resend / Nodemailer 연동)
  // 현재는 개발환경에서 콘솔 출력
  if (process.env.NODE_ENV === "development") {
    console.log("\n🔑 [비밀번호 재설정 링크]");
    console.log(`   수신자: ${user.name} (${user.email})`);
    console.log(`   링크:   ${resetUrl}`);
    console.log(`   유효:   1시간\n`);
  }

  return NextResponse.json({ ok: true });
}
