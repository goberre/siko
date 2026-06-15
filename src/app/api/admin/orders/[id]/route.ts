import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const statusSchema = z.enum(["pending", "processing", "completed", "cancelled"]);

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "admin") return null;
  return session;
}

// 주문 상태 변경
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireAdmin()) return new NextResponse("Unauthorized", { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = statusSchema.safeParse(body?.status);
  if (!parsed.success) {
    return NextResponse.json({ error: "유효하지 않은 상태값" }, { status: 400 });
  }

  try {
    const updated = await prisma.order.update({
      where: { id },
      data:  { status: parsed.data },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "주문을 찾을 수 없습니다" }, { status: 404 });
  }
}
