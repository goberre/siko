import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import { verifyBusinessNumberWithNts } from "@/lib/businessNumber";
import { writeAuditLog } from "@/lib/auditLog";
import { checkRateLimit, LIMITS } from "@/lib/rateLimit";

const MAX_BODY_SIZE = 8 * 1024; // 8 KB

export async function POST(req: NextRequest) {
  // 요청 본문 크기 제한
  const contentLength = Number(req.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_SIZE) {
    return NextResponse.json({ error: "요청 크기가 너무 큽니다." }, { status: 413 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const ua = req.headers.get("user-agent") ?? "";

  // ── Rate Limiting ────────────────────────────────────────
  const rl = checkRateLimit(`register:${ip}`, LIMITS.REGISTER);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "요청이 너무 많습니다. 10분 후 다시 시도해주세요." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();

    // ── 입력값 유효성 검사 (Zod) ─────────────────────────
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstError.message, field: String(firstError.path[0] ?? "") },
        { status: 400 }
      );
    }

    const { name, email, password, phone, businessNumber, businessName } = parsed.data;

    // ── 이메일 중복 확인 ──────────────────────────────────
    const existingEmail = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existingEmail) {
      return NextResponse.json(
        { error: "이미 사용 중인 이메일입니다.", field: "email" },
        { status: 409 }
      );
    }

    // ── 사업자등록번호 중복 확인 ──────────────────────────
    const digits    = businessNumber.replace(/-/g, "");
    const formatted = `${digits.slice(0,3)}-${digits.slice(3,5)}-${digits.slice(5)}`;

    const existingBiz = await prisma.user.findFirst({
      where: { businessNumber: formatted },
      select: { id: true },
    });
    if (existingBiz) {
      return NextResponse.json(
        { error: "이미 가입된 사업자등록번호입니다.", field: "businessNumber" },
        { status: 409 }
      );
    }

    // ── 국세청 사업자 상태 재확인 (서버측 최종 검증) ──────
    const bizResult = await verifyBusinessNumberWithNts(businessNumber);
    if (!bizResult.isValid || !bizResult.isActive) {
      await writeAuditLog({
        action: "REGISTER_FAIL",
        ip,
        detail: `사업자 인증 실패: ${businessNumber} — ${bizResult.status}`,
      });
      return NextResponse.json(
        { error: bizResult.status || "사업자 인증에 실패했습니다.", field: "businessNumber" },
        { status: 400 }
      );
    }

    // ── 비밀번호 해싱 (bcrypt rounds: 12) ─────────────────
    const hashedPassword = await bcrypt.hash(password, 12);

    // ── 유저 생성 ─────────────────────────────────────────
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password:         hashedPassword,
        phone:            phone || null,
        role:             "user",
        businessNumber:   formatted,
        businessName:     businessName,
        businessVerified: bizResult.source === "nts_api",  // API 확인 시만 true
        businessStatus:   bizResult.status,
      },
      select: { id: true, name: true, email: true, businessVerified: true },
    });

    await writeAuditLog({
      action: "REGISTER",
      userId: user.id,
      ip,
      userAgent: ua,
      detail: `사업자: ${formatted} (${bizResult.source})`,
    });

    return NextResponse.json(
      { message: "회원가입이 완료되었습니다.", user },
      { status: 201 }
    );
  } catch (error) {
    console.error("[register]", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }
}
