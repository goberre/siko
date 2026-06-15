import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const serviceSchema = z.object({
  title:       z.string().min(1, "서비스명 필수"),
  category:    z.string().min(1, "카테고리 필수"),
  subcategory: z.string().default(""),
  industry:    z.array(z.string()).default([]),
  price:       z.number().int().positive("가격은 0보다 커야 합니다"),
  priceUnit:   z.string().default("건"),
  rating:      z.number().min(0).max(5).default(5.0),
  reviewCount: z.number().int().min(0).default(0),
  badge:       z.enum(["인기", "신규", "추천"]).nullable().optional(),
  description: z.string().default(""),
  tags:        z.array(z.string()).default([]),
  active:      z.boolean().default(true),
});

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "admin") return null;
  return session;
}

// 어드민 서비스 전체 목록
export async function GET() {
  if (!await requireAdmin()) return new NextResponse("Unauthorized", { status: 401 });

  const services = await prisma.service.findMany({
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(services);
}

// 서비스 생성
export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return new NextResponse("Unauthorized", { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Bad request" }, { status: 400 });

  // 단일 또는 배열(일괄 등록)
  const isBulk = Array.isArray(body);
  const items  = isBulk ? body : [body];

  const results = [];
  const errors: { index: number; message: string }[] = [];

  for (let i = 0; i < items.length; i++) {
    const parsed = serviceSchema.safeParse(items[i]);
    if (!parsed.success) {
      errors.push({ index: i, message: parsed.error.issues[0]?.message ?? "유효성 오류" });
      continue;
    }
    const svc = await prisma.service.create({
      data: { ...parsed.data, badge: parsed.data.badge ?? null },
    });
    results.push(svc);
  }

  return NextResponse.json({ created: results, errors });
}
