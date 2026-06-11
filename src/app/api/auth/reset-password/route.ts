import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rateLimit";
import { writeAuditLog } from "@/lib/auditLog";

const schema = z.object({
  token:    z.string().length(64, "올바르지 않은 토큰"),
  email:    z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/).regex(/[^A-Za-z0-9]/),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = checkRateLimit(`reset:${ip}`, { max: 5, windowMs: 15 * 60_000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "요청이 너무 많습니다." }, { status: 429 });
  }

  const body   = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const { token, email, password } = parsed.data;

  // 토큰 조회
  const vt = await prisma.verificationToken.findUnique({
    where: { identifier_token: { identifier: `reset:${email}`, token } },
  });

  if (!vt) {
    return NextResponse.json({ error: "유효하지 않은 링크입니다." }, { status: 400 });
  }
  if (vt.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token } });
    return NextResponse.json({ error: "링크가 만료되었습니다. 다시 요청해주세요." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, password: true } });
  if (!user) {
    return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 400 });
  }

  // 기존 비밀번호와 동일한지 확인 (재사용 방지)
  const isSame = await bcrypt.compare(password, user.password);
  if (isSame) {
    return NextResponse.json({ error: "기존 비밀번호와 동일합니다. 새 비밀번호를 입력해주세요." }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 12);

  // 비밀번호 업데이트 + 잠금 해제 + 토큰 삭제
  await Promise.all([
    prisma.user.update({
      where: { id: user.id },
      data:  { password: hashed, loginAttempts: 0, lockedUntil: null },
    }),
    prisma.verificationToken.delete({ where: { token } }),
  ]);

  await writeAuditLog({ action: "PASSWORD_RESET", userId: user.id, ip });

  return NextResponse.json({ ok: true });
}
