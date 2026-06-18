import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const patchSchema = z.object({
  status:    z.enum(["pending", "processing", "completed", "cancelled"]).optional(),
  adminMemo: z.string().optional(),
}).refine((d) => d.status !== undefined || d.adminMemo !== undefined, {
  message: "status 또는 adminMemo 중 하나는 필요합니다",
});

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "admin") return null;
  return session;
}

// 주문 상태 변경 / 관리자 메모 저장
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireAdmin()) return new NextResponse("Unauthorized", { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "유효하지 않은 요청" }, { status: 400 });
  }

  const updateData: { status?: string; adminMemo?: string } = {};
  if (parsed.data.status    !== undefined) updateData.status    = parsed.data.status;
  if (parsed.data.adminMemo !== undefined) updateData.adminMemo = parsed.data.adminMemo;

  try {
    const updated = await prisma.order.update({
      where: { id },
      data:  updateData,
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "주문을 찾을 수 없습니다" }, { status: 404 });
  }
}
