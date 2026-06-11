import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { verifyBusinessNumberWithNts } from "@/lib/businessNumber";
import { writeAuditLog } from "@/lib/auditLog";

/** 어드민 — 특정 회원 사업자 수동 재검증 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = await req.json().catch(() => ({ userId: "" }));
  if (!userId) return NextResponse.json({ error: "userId 필요" }, { status: 400 });

  const user = await prisma.user.findUnique({
    where:  { id: userId },
    select: { id: true, businessNumber: true, businessActive: true },
  });

  if (!user || !user.businessNumber) {
    return NextResponse.json({ error: "사업자 정보가 없는 회원입니다" }, { status: 400 });
  }

  const result = await verifyBusinessNumberWithNts(user.businessNumber);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      businessStatus:        result.status,
      businessActive:        result.isActive,
      businessLastCheckedAt: new Date(),
    },
  });

  const wasActive = user.businessActive;
  if (wasActive && !result.isActive) {
    await writeAuditLog({
      action: "ADMIN_ACTION",
      userId: user.id,
      detail: `관리자 수동 재검증 → ${result.status} (비활성 처리)`,
    });
  }

  return NextResponse.json({
    ok:       true,
    status:   result.status,
    isActive: result.isActive,
    source:   result.source,
  });
}
