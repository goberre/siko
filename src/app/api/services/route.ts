import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
      select: {
        id: true, title: true, description: true, category: true,
        subcategory: true, tags: true, price: true, priceUnit: true,
        rating: true, reviewCount: true, badge: true, active: true, industry: true,
      },
    });

    return NextResponse.json(services, {
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
      },
    });
  } catch (e) {
    console.error("[GET /api/services]", e);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
