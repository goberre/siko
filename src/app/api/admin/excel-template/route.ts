import ExcelJS from "exceljs";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

// ── 상수 ──────────────────────────────────────────────────

const CATEGORY_OPTIONS = [
  { id: "store", label: "스토어" },
  { id: "place", label: "플레이스" },
  { id: "app",   label: "앱" },
  { id: "seo",   label: "SEO" },
  { id: "sns",   label: "SNS" },
  { id: "blog",  label: "블로그" },
  { id: "ad",    label: "검색광고" },
  { id: "etc",   label: "기타" },
];

const INDUSTRY_OPTIONS = [
  { id: "restaurant",    label: "음식점·카페" },
  { id: "beauty",        label: "뷰티·미용" },
  { id: "shopping",      label: "쇼핑몰·스토어" },
  { id: "hospital",      label: "병원·의원" },
  { id: "accommodation", label: "숙박·여행" },
  { id: "app",           label: "앱·서비스" },
  { id: "creator",       label: "인플루언서·크리에이터" },
  { id: "brand",         label: "브랜드·기업" },
];

const BADGE_OPTIONS  = ["인기", "신규", "추천"];
const UNIT_OPTIONS   = ["건", "월", "일", "회"];
const HEADER_COLOR   = "FF1E3A5F";
const HEADER_FONT    = "FFFFFFFF";
const REQUIRED_COLOR = "FFFFF3CD";
const SAMPLE_COLOR   = "FFF0F9FF";
const DATA_ROWS      = 500;

// ── Route Handler ─────────────────────────────────────────

export async function GET() {
  // 어드민 인증 검사
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const wb = new ExcelJS.Workbook();
  wb.creator = "SIKO Admin";
  wb.created = new Date();

  /* ── 참조 시트 (_ref) ── */
  const refSheet = wb.addWorksheet("_ref");
  refSheet.state = "veryHidden";

  CATEGORY_OPTIONS.forEach((c, i) => {
    refSheet.getCell(i + 1, 1).value = c.id;
    refSheet.getCell(i + 1, 2).value = c.label;
  });
  UNIT_OPTIONS.forEach((u, i) => { refSheet.getCell(i + 1, 3).value = u; });
  BADGE_OPTIONS.forEach((b, i) => { refSheet.getCell(i + 1, 4).value = b; });
  INDUSTRY_OPTIONS.forEach((ind, i) => {
    refSheet.getCell(i + 1, 5).value = ind.id;
    refSheet.getCell(i + 1, 6).value = ind.label;
  });

  wb.definedNames.add(`_ref!$A$1:$A$${CATEGORY_OPTIONS.length}`, "카테고리목록");
  wb.definedNames.add(`_ref!$C$1:$C$${UNIT_OPTIONS.length}`,     "단위목록");
  wb.definedNames.add(`_ref!$D$1:$D$${BADGE_OPTIONS.length}`,    "뱃지목록");

  /* ── 메인 시트 ── */
  const ws = wb.addWorksheet("서비스 목록", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  const columns = [
    { header: "서비스명 *",     key: "title",       width: 36, required: true  },
    { header: "카테고리 *",     key: "category",    width: 13, required: true  },
    { header: "세부분류",        key: "subcategory", width: 20, required: false },
    { header: "기본가격(원) *",  key: "price",       width: 14, required: true  },
    { header: "단위",            key: "priceUnit",   width: 7,  required: false },
    { header: "서비스 설명",     key: "description", width: 42, required: false },
    { header: "뱃지",            key: "badge",       width: 7,  required: false },
    { header: "태그",            key: "tags",        width: 26, required: false },
    { header: "업종",            key: "industry",    width: 38, required: false },
  ];

  ws.columns = columns.map((c) => ({ header: c.header, key: c.key, width: c.width }));

  ws.getRow(1).eachCell((cell, colNum) => {
    const col = columns[colNum - 1];
    cell.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: col?.required ? "FF1D4ED8" : HEADER_COLOR } };
    cell.font      = { bold: true, color: { argb: HEADER_FONT }, size: 10 };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border    = { bottom: { style: "medium", color: { argb: "FF3B82F6" } } };
  });
  ws.getRow(1).height = 22;

  const sampleRows = [
    { title: "네이버 플레이스 상위노출", category: "place", subcategory: "네이버 플레이스", price: 11000, priceUnit: "건", description: "영수증리뷰·예약리뷰·저장하기·즐겨찾기 관리로 최상단 노출.", badge: "인기", tags: "영수증리뷰,예약리뷰,저장하기", industry: "restaurant,beauty,hospital" },
    { title: "인스타그램 팔로워 마케팅", category: "sns",   subcategory: "인스타그램",      price: 8000,  priceUnit: "건", description: "실사용자 기반 팔로워·좋아요·댓글 증가 서비스.",       badge: "신규", tags: "팔로워,좋아요,댓글",           industry: "creator,beauty" },
  ];

  sampleRows.forEach((data) => {
    const row = ws.addRow(data);
    row.eachCell((cell) => {
      cell.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: SAMPLE_COLOR } };
      cell.font      = { color: { argb: "FF64748B" }, italic: true, size: 9 };
      cell.alignment = { vertical: "middle" };
    });
  });

  for (let r = 3; r <= DATA_ROWS + 2; r++) {
    const row = ws.getRow(r);
    row.height = 18;
    [1, 2, 4].forEach((ci) => {
      row.getCell(ci).fill = { type: "pattern", pattern: "solid", fgColor: { argb: REQUIRED_COLOR } };
    });
    row.getCell(2).dataValidation = { type: "list",  allowBlank: true, formulae: ["카테고리목록"], showErrorMessage: true, errorStyle: "stop",    errorTitle: "카테고리 오류", error: "목록에서 선택해주세요" };
    row.getCell(5).dataValidation = { type: "list",  allowBlank: true, formulae: ["단위목록"],     showErrorMessage: true, errorStyle: "warning", errorTitle: "단위 오류",     error: "건/월/일/회 중 선택" };
    row.getCell(7).dataValidation = { type: "list",  allowBlank: true, formulae: ["뱃지목록"],     showErrorMessage: false };
    row.getCell(4).dataValidation = { type: "whole", allowBlank: true, operator: "greaterThan", formulae: [0], showErrorMessage: true, errorStyle: "warning", errorTitle: "가격 오류", error: "0보다 큰 숫자를 입력하세요" };
  }

  /* ── 안내 시트 ── */
  const guideSheet = wb.addWorksheet("작성 안내");
  guideSheet.columns = [{ width: 20 }, { width: 55 }];
  const guideRows: [string, string][] = [
    ["■ 사용 방법", ""],
    ["STEP 1", "'서비스 목록' 시트에서 데이터 입력"],
    ["STEP 2", "B/E/G열은 드롭다운 선택"],
    ["STEP 3", "1~2행 샘플은 삭제 후 입력"],
    ["STEP 4", "관리자 > 서비스 관리 > 엑셀 업로드"],
    ["", ""],
    ["■ 카테고리 코드", ""],
    ...CATEGORY_OPTIONS.map((c): [string, string] => [c.id, c.label]),
    ["", ""],
    ["■ 업종 코드", "복수 선택: restaurant,beauty"],
    ...INDUSTRY_OPTIONS.map((i): [string, string] => [i.id, i.label]),
  ];
  guideRows.forEach(([c1, c2]) => {
    const row = guideSheet.addRow([c1, c2]);
    if (c1.startsWith("■")) row.getCell(1).font = { bold: true, color: { argb: "FF1D4ED8" } };
    else if (c1.startsWith("STEP")) row.getCell(1).font = { bold: true, color: { argb: "FF059669" } };
  });

  const buffer = await wb.xlsx.writeBuffer();
  return new NextResponse(buffer, {
    headers: {
      "Content-Type":        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename*=UTF-8''SIKO_%EC%84%9C%EB%B9%84%EC%8A%A4_%EB%93%B1%EB%A1%9D_%EC%96%91%EC%8B%9D.xlsx",
    },
  });
}
