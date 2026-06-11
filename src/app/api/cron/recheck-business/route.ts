import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyBusinessNumberWithNts } from "@/lib/businessNumber";
import { writeAuditLog } from "@/lib/auditLog";

/**
 * 사업자등록 상태 주기적 재검증 API
 *
 * 호출 방법:
 *   GET /api/cron/recheck-business
 *   Authorization: Bearer <CRON_SECRET>
 *
 * 운영 환경 자동화:
 *   - Vercel Cron: vercel.json 에 { "crons": [{ "path": "/api/cron/recheck-business", "schedule": "0 2 * * *" }] }
 *   - 서버 크론탭: 0 2 * * * curl -H "Authorization: Bearer $CRON_SECRET" https://사이트주소/api/cron/recheck-business
 *
 * 매일 새벽 2시 실행 권장 (NTS API 부하 최소화)
 * NTS 무료 한도: 일 1,000건 (초과 시 유료 전환 필요)
 */
export async function GET(req: NextRequest) {
  // ── 인증 검사 ──────────────────────────────────────────
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startTime = Date.now();

  // ── 재검증 대상 조회 ──────────────────────────────────
  // 사업자 인증된 활성 유저 중 마지막 검증이 24시간 이상 지났거나 미검증인 경우
  const cutoff = new Date(Date.now() - 24 * 60 * 60_000);

  const users = await prisma.user.findMany({
    where: {
      businessNumber:   { not: null },
      businessVerified: true,
      OR: [
        { businessLastCheckedAt: null },
        { businessLastCheckedAt: { lt: cutoff } },
      ],
    },
    select: {
      id:             true,
      email:          true,
      businessNumber: true,
      businessStatus: true,
      businessActive: true,
    },
  });

  const results = {
    total:       users.length,
    active:      0,
    suspended:   0,   // 휴업
    closed:      0,   // 폐업
    unregistered: 0,  // 미등록
    errors:      0,
    deactivated: 0,   // 이번 검증에서 비활성 처리된 수
  };

  // ── 배치 처리 (NTS API 과부하 방지: 건당 200ms 간격) ──
  for (const user of users) {
    if (!user.businessNumber) continue;

    try {
      const result = await verifyBusinessNumberWithNts(user.businessNumber);
      const now    = new Date();

      const wasActive  = user.businessActive;
      const isNowActive = result.isActive;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          businessStatus:        result.status,
          businessActive:        isNowActive,
          businessLastCheckedAt: now,
          // 재검증 실패(폐업·휴업)인 경우 businessVerified는 유지하되 businessActive만 false
        },
      });

      if (result.statusCode === "01" || result.isActive) {
        results.active++;
      } else if (result.statusCode === "02") {
        results.suspended++;
      } else if (result.statusCode === "03") {
        results.closed++;
      } else {
        results.unregistered++;
      }

      // 상태 변화 감사 로그
      if (wasActive && !isNowActive) {
        results.deactivated++;
        await writeAuditLog({
          action:  "ADMIN_ACTION",
          userId:  user.id,
          detail:  `사업자 상태 변경 감지 → ${result.status} (재검증 비활성화)`,
        });
      }
    } catch {
      results.errors++;
    }

    // NTS API 과부하 방지
    await new Promise((r) => setTimeout(r, 200));
  }

  const elapsed = Date.now() - startTime;

  return NextResponse.json({
    ok:       true,
    checked:  results.total,
    results,
    elapsed:  `${elapsed}ms`,
    checkedAt: new Date().toISOString(),
  });
}
