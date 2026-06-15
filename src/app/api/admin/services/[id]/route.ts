import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "admin") return null;
  return session;
}

// 서비스 수정
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireAdmin()) return new NextResponse("Unauthorized", { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Bad request" }, { status: 400 });

  try {
    const updated = await prisma.service.update({
      where: { id },
      data: {
        title:       body.title,
        category:    body.category,
        subcategory: body.subcategory ?? "",
        industry:    body.industry    ?? [],
        price:       Number(body.price),
        priceUnit:   body.priceUnit   ?? "건",
        rating:      Number(body.rating) || 5.0,
        reviewCount: Number(body.reviewCount) || 0,
        badge:       body.badge       ?? null,
        description: body.description ?? "",
        tags:        body.tags        ?? [],
        active:      body.active      ?? true,
      },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "서비스를 찾을 수 없습니다" }, { status: 404 });
  }
}

// 서비스 삭제
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireAdmin()) return new NextResponse("Unauthorized", { status: 401 });

  const { id } = await params;
  try {
    await prisma.service.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "서비스를 찾을 수 없습니다" }, { status: 404 });
  }
}
