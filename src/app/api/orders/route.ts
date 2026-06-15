import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const orderSchema = z.object({
  serviceId:   z.string().min(1),
  serviceName: z.string().min(1),
  tier:        z.enum(["스타터", "스탠다드", "프로"]),
  amount:      z.number().int().positive(),
});

// 주문 생성
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });

  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "유효성 오류" },
      { status: 400 }
    );
  }

  // 서비스 존재 여부 확인
  const service = await prisma.service.findUnique({
    where: { id: parsed.data.serviceId, active: true },
  });
  if (!service) {
    return NextResponse.json({ error: "존재하지 않는 서비스입니다." }, { status: 404 });
  }

  const order = await prisma.order.create({
    data: {
      userId:      session.user.id!,
      serviceId:   parsed.data.serviceId,
      serviceName: parsed.data.serviceName,
      tier:        parsed.data.tier,
      amount:      parsed.data.amount,
      status:      "pending",
    },
  });

  return NextResponse.json({ ok: true, orderId: order.id }, { status: 201 });
}

// 내 주문 목록 (로그인 유저)
export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where:   { userId: session.user.id! },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}
