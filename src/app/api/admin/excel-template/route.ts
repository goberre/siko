import { NextResponse } from "next/server";
import { auth } from "@/auth";

// CSV 템플릿 (외부 라이브러리 없이 생성 — Cloudflare Workers 용량 최적화)

const HEADERS = [
  "서비스명", "카테고리", "세부분류", "기본가격(원)",
  "단위", "서비스설명", "뱃지", "태그", "업종",
];

const SAMPLE_ROWS: string[][] = [
  ["네이버 플레이스 상위노출", "place", "네이버 플레이스", "11000", "건", "영수증리뷰·예약리뷰·저장하기·즐겨찾기 관리로 최상단 노출.", "인기", "영수증리뷰,예약리뷰,저장하기", "restaurant,beauty,hospital"],
  ["인스타그램 팔로워 마케팅", "sns", "인스타그램", "8000", "건", "실사용자 기반 팔로워·좋아요·댓글 증가 서비스.", "신규", "팔로워,좋아요,댓글", "creator,beauty"],
];

const GUIDE_ROWS: string[][] = [
  [],
  ["# 작성 안내 (이 # 줄들은 업로드 전에 삭제하세요)"],
  ["# 카테고리 코드: store=스토어 place=플레이스 app=앱 seo=SEO sns=SNS blog=블로그 ad=검색광고 etc=기타"],
  ["# 단위: 건 / 월 / 일 / 회 중 하나"],
  ["# 뱃지: 인기 / 신규 / 추천 (없으면 빈칸)"],
  ["# 태그·업종: 쉼표(,)로 여러 개 구분"],
  ["# 업종 코드: restaurant=음식점·카페 beauty=뷰티·미용 shopping=쇼핑몰·스토어 hospital=병원·의원 accommodation=숙박·여행 app=앱·서비스 creator=인플루언서·크리에이터 brand=브랜드·기업"],
];

/** CSV 한 셀 이스케이프 (쉼표·따옴표·줄바꿈 포함 시 따옴표로 감쌈) */
function esc(v: string): string {
  if (/[",\n\r]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

function toCsvLine(cells: string[]): string {
  return cells.map(esc).join(",");
}

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const lines = [
    toCsvLine(HEADERS),
    ...SAMPLE_ROWS.map(toCsvLine),
    ...GUIDE_ROWS.map(toCsvLine),
  ];

  // BOM 추가 → Excel에서 한글 깨짐 방지
  const csv = "\uFEFF" + lines.join("\r\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type":        "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename*=UTF-8''SIKO_%EC%84%9C%EB%B9%84%EC%8A%A4_%EB%93%B1%EB%A1%9D_%EC%96%91%EC%8B%9D.csv",
      "Cache-Control":       "no-store",
    },
  });
}
