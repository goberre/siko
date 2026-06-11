import { NextRequest, NextResponse } from "next/server";
import { verifyBusinessNumberWithNts, validateBusinessNumberFormat } from "@/lib/businessNumber";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, LIMITS } from "@/lib/rateLimit";

const MAX_BODY_SIZE = 2 * 1024; // 2 KB

export async function POST(req: NextRequest) {
  // 요청 본문 크기 제한
  const contentLength = Number(req.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_SIZE) {
    return NextResponse.json({ error: "요청 크기가 너무 큽니다." }, { status: 413 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  const rl = checkRateLimit(`verify:${ip}`, LIMITS.VERIFY);
  if (!rl.allowed) {
    return NextResponse.json({ error: "너무 많은 요청입니다. 잠시 후 다시 시도해주세요." }, { status: 429 });
  }

  const { businessNumber } = await req.json().catch(() => ({ businessNumber: "" }));

  if (!businessNumber || typeof businessNumber !== "string") {
    return NextResponse.json({ error: "사업자등록번호를 입력해주세요." }, { status: 400 });
  }

  // 입력 길이 제한 (인젝션 방어)
  if (businessNumber.length > 20) {
    return NextResponse.json({ error: "올바르지 않은 사업자등록번호입니다." }, { status: 400 });
  }

  // 형식 검사
  if (!validateBusinessNumberFormat(businessNumber)) {
    return NextResponse.json(
      { valid: false, error: "올바르지 않은 사업자등록번호입니다. 형식을 확인해주세요.", isActive: false },
      { status: 400 }
    );
  }

  // 이미 가입된 번호인지 확인
  const digits    = businessNumber.replace(/-/g, "");
  const formatted = `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;

  const existing = await prisma.user.findFirst({
    where: { businessNumber: formatted },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json(
      { valid: false, error: "이미 가입된 사업자등록번호입니다.", isActive: false },
      { status: 409 }
    );
  }

  // 국세청 API 검증
  const result = await verifyBusinessNumberWithNts(businessNumber);

  if (!result.isValid) {
    return NextResponse.json(
      { valid: false, error: result.status, isActive: false },
      { status: 400 }
    );
  }

  if (!result.isActive) {
    const msg =
      result.statusCode === "02" ? "휴업 상태인 사업자입니다. 계속사업자만 가입 가능합니다." :
      result.statusCode === "03" ? "폐업된 사업자입니다." :
      result.statusCode === ""   ? "국세청에 등록되지 않은 사업자등록번호입니다." :
      `현재 가입할 수 없는 사업자 상태입니다. (${result.status})`;
    return NextResponse.json({ valid: false, error: msg, isActive: false }, { status: 400 });
  }

  return NextResponse.json({ valid: true, status: result.status, taxType: result.taxType, isActive: result.isActive, source: result.source, formatted });
}
