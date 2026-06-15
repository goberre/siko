import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 공개 서비스 목록 조회
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const industry = searchParams.get("industry");

    const where: Record<string, unknown> = { active: true };
    if (category && category !== "all") where.category = category;
    if (industry)  where.industry = { has: industry };

    const services = await prisma.service.findMany({
      where,
      orderBy: [{ badge: "asc" }, { reviewCount: "desc" }],
    });

    return NextResponse.json(services);
  } catch (e) {
    console.error("[GET /api/services]", e);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
