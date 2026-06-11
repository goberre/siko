import * as XLSX from "xlsx";
import type { Service } from "./data";

/* ── 참조 데이터 ─────────────────────────────────────── */
export const CATEGORY_OPTIONS = [
  { id: "store", label: "스토어" },
  { id: "place", label: "플레이스" },
  { id: "app",   label: "앱" },
  { id: "seo",   label: "SEO" },
  { id: "sns",   label: "SNS" },
  { id: "blog",  label: "블로그" },
  { id: "ad",    label: "검색광고" },
  { id: "etc",   label: "기타" },
];

export const INDUSTRY_OPTIONS = [
  { id: "restaurant",    label: "음식점·카페" },
  { id: "beauty",        label: "뷰티·미용" },
  { id: "shopping",      label: "쇼핑몰·스토어" },
  { id: "hospital",      label: "병원·의원" },
  { id: "accommodation", label: "숙박·여행" },
  { id: "app",           label: "앱·서비스" },
  { id: "creator",       label: "인플루언서·크리에이터" },
  { id: "brand",         label: "브랜드·기업" },
];

const UNIT_OPTIONS   = ["건", "월", "일", "회"];
const BADGE_OPTIONS  = ["인기", "신규", "추천"];

/* ── 컬럼 정의 (col index 0-based) ──────────────────── */
//  A=0 서비스명  B=1 카테고리  C=2 세부분류  D=3 가격
//  E=4 단위      F=5 설명      G=6 뱃지      H=7 태그  I=8 업종
export const COLUMNS = [
  { key: "title",       header: "서비스명 *",    width: 36 },
  { key: "category",    header: "카테고리 *",    width: 13 },
  { key: "subcategory", header: "세부분류",       width: 20 },
  { key: "price",       header: "기본가격(원) *", width: 14 },
  { key: "priceUnit",   header: "단위",           width: 7  },
  { key: "description", header: "서비스 설명",    width: 42 },
  { key: "badge",       header: "뱃지",           width: 7  },
  { key: "tags",        header: "태그",           width: 26 },
  { key: "industry",    header: "업종",           width: 38 },
];

/* ── 샘플 행 ─────────────────────────────────────────── */
const SAMPLE_ROWS = [
  {
    title: "네이버 플레이스 상위노출",
    category: "place",
    subcategory: "네이버 플레이스",
    price: 11000,
    priceUnit: "건",
    description: "영수증리뷰·예약리뷰·저장하기·즐겨찾기 관리로 플레이스 최상단 노출.",
    badge: "인기",
    tags: "영수증리뷰,예약리뷰,저장하기",
    industry: "restaurant,beauty,hospital",
  },
  {
    title: "인스타그램 팔로워 마케팅",
    category: "sns",
    subcategory: "인스타그램",
    price: 8000,
    priceUnit: "건",
    description: "실사용자 기반 팔로워·좋아요·댓글 증가 서비스.",
    badge: "신규",
    tags: "팔로워,좋아요,댓글",
    industry: "creator,beauty",
  },
];

/* ══════════════════════════════════════════════════════
   템플릿 다운로드
══════════════════════════════════════════════════════ */
export function downloadTemplate() {
  const wb = XLSX.utils.book_new();

  /* ── 1. 참조 시트 (_ref) ────────────────────────── */
  // 드롭다운 소스가 될 값들을 숨김 시트에 저장
  const maxLen = Math.max(
    CATEGORY_OPTIONS.length,
    UNIT_OPTIONS.length,
    BADGE_OPTIONS.length,
    INDUSTRY_OPTIONS.length
  );

  const refRows: (string)[][] = [
    ["카테고리ID", "카테고리명", "단위", "뱃지", "업종ID", "업종명"],
  ];
  for (let i = 0; i < maxLen; i++) {
    refRows.push([
      CATEGORY_OPTIONS[i]?.id    ?? "",
      CATEGORY_OPTIONS[i]?.label ?? "",
      UNIT_OPTIONS[i]            ?? "",
      BADGE_OPTIONS[i]           ?? "",
      INDUSTRY_OPTIONS[i]?.id    ?? "",
      INDUSTRY_OPTIONS[i]?.label ?? "",
    ]);
  }

  const wsRef = XLSX.utils.aoa_to_sheet(refRows);
  wsRef["!cols"] = [
    { wch: 14 }, { wch: 16 }, { wch: 6 }, { wch: 6 }, { wch: 18 }, { wch: 20 },
  ];
  XLSX.utils.book_append_sheet(wb, wsRef, "_ref");

  /* ── 2. 입력 시트 (서비스 목록) ─────────────────── */
  const headers = COLUMNS.map((c) => c.header);
  const sampleData = SAMPLE_ROWS.map((row) =>
    COLUMNS.map((c) => (row as Record<string, string | number>)[c.key] ?? "")
  );

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
  ws["!cols"] = COLUMNS.map((c) => ({ wch: c.width }));

  // 행 고정 (헤더)
  ws["!freeze"] = { xSplit: 0, ySplit: 1 };

  /* ── 3. 데이터 유효성 검사 (드롭다운) ────────────
     sqref: "열행:열행"  (Excel 스타일)
     type: "list"
     formula1: 시트참조 또는 직접 문자열 '"a,b,c"'
  ────────────────────────────────────────────────── */
  const DATA_ROWS = 500; // 드롭다운 적용 행 수

  ws["!dataValidations"] = [
    // B열: 카테고리 (참조 시트 A열)
    {
      type: "list",
      sqref: `B2:B${DATA_ROWS}`,
      formula1: `_ref!$A$2:$A${CATEGORY_OPTIONS.length + 1}`,
      showDropDown: false,
      showErrorMessage: true,
      errorTitle: "카테고리 오류",
      error: "목록에서 카테고리를 선택해주세요",
    },
    // E열: 단위
    {
      type: "list",
      sqref: `E2:E${DATA_ROWS}`,
      formula1: `_ref!$C$2:$C${UNIT_OPTIONS.length + 1}`,
      showDropDown: false,
      showErrorMessage: true,
      errorTitle: "단위 오류",
      error: "건 / 월 / 일 / 회 중 하나를 선택해주세요",
    },
    // G열: 뱃지
    {
      type: "list",
      sqref: `G2:G${DATA_ROWS}`,
      formula1: `_ref!$D$2:$D${BADGE_OPTIONS.length + 1}`,
      showDropDown: false,
      showErrorMessage: false, // 빈칸 허용
    },
    // D열: 가격 (숫자만)
    {
      type: "whole",
      sqref: `D2:D${DATA_ROWS}`,
      operator: "greaterThan",
      formula1: "0",
      showErrorMessage: true,
      errorTitle: "가격 오류",
      error: "0보다 큰 정수를 입력해주세요",
    },
  ];

  XLSX.utils.book_append_sheet(wb, ws, "서비스 목록");

  /* ── 4. 안내 시트 ────────────────────────────────── */
  const guideRows: string[][] = [
    ["■ SIKO 서비스 일괄 등록 양식 사용법"],
    [""],
    ["STEP 1", "'서비스 목록' 시트에서 데이터를 입력합니다"],
    ["STEP 2", "B열(카테고리), E열(단위), G열(뱃지)는 드롭다운으로 선택할 수 있습니다"],
    ["STEP 3", "작성 완료 후 파일을 저장하고 관리자 페이지에서 '엑셀 업로드'를 클릭합니다"],
    [""],
    ["■ 컬럼 설명"],
    ["서비스명 *",    "필수. 고객에게 표시되는 서비스 이름"],
    ["카테고리 *",    "필수. 아래 카테고리 코드표 참고 (드롭다운 선택 가능)"],
    ["세부분류",      "예: 네이버 플레이스, 구글플레이, 인스타그램"],
    ["기본가격(원) *","필수. 숫자만 입력 (예: 10000)"],
    ["단위",         "건 / 월 / 일 / 회 중 선택 (드롭다운)"],
    ["서비스 설명",   "고객에게 보여지는 상세 설명"],
    ["뱃지",         "인기 / 신규 / 추천 중 선택, 없으면 빈칸 (드롭다운)"],
    ["태그",         "쉼표로 구분. 예: 팔로워,좋아요,댓글"],
    ["업종",         "쉼표로 구분. 아래 업종 코드표 참고"],
    [""],
    ["■ 카테고리 코드표"],
    ...CATEGORY_OPTIONS.map((c) => [c.id, c.label]),
    [""],
    ["■ 업종 코드표 (복수 선택 시 쉼표로 구분)"],
    ...INDUSTRY_OPTIONS.map((i) => [i.id, i.label]),
    [""],
    ["■ 주의사항"],
    ["", "* 표시 컬럼은 필수 입력입니다"],
    ["", "1회 최대 500행까지 드롭다운이 지원됩니다"],
    ["", "_ref 시트는 드롭다운 데이터 시트로, 수정하지 마세요"],
  ];

  const wsGuide = XLSX.utils.aoa_to_sheet(guideRows);
  wsGuide["!cols"] = [{ wch: 18 }, { wch: 55 }];
  XLSX.utils.book_append_sheet(wb, wsGuide, "작성 안내");

  /* ── 시트 순서 정렬: 서비스 목록을 첫 번째로 ─────── */
  // SheetNames 재정렬
  wb.SheetNames = ["서비스 목록", "_ref", "작성 안내"];

  XLSX.writeFile(wb, "SIKO_서비스_등록_양식.xlsx");
}

/* ══════════════════════════════════════════════════════
   파일 파싱 (업로드)
══════════════════════════════════════════════════════ */
export type ParseResult = {
  ok: Service[];
  errors: { row: number; message: string }[];
};

const VALID_CATEGORIES = new Set(CATEGORY_OPTIONS.map((c) => c.id));
const VALID_BADGE      = new Set(BADGE_OPTIONS);
const VALID_UNITS      = new Set(UNIT_OPTIONS);
const VALID_INDUSTRIES = new Set(INDUSTRY_OPTIONS.map((i) => i.id));

// 카테고리 한글명 → ID 역매핑 (한글로 입력해도 허용)
const CAT_LABEL_TO_ID: Record<string, string> = Object.fromEntries(
  CATEGORY_OPTIONS.map((c) => [c.label, c.id])
);

export function parseExcel(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const wb = XLSX.read(data, { type: "binary" });

        // "서비스 목록" 시트 우선, 없으면 첫 번째 시트
        const sheetName =
          wb.SheetNames.find((n) => n === "서비스 목록") ?? wb.SheetNames[0];
        const ws = wb.Sheets[sheetName];

        const rows = XLSX.utils.sheet_to_json<Record<string, string | number>>(ws, {
          defval: "",
          raw: true,
        });

        const ok: Service[] = [];
        const errors: { row: number; message: string }[] = [];

        rows.forEach((raw, idx) => {
          const rowNum = idx + 2;

          // 헤더 이름으로 값 읽기 (별표 포함 헤더 자동 처리)
          const get = (key: string): string => {
            // 정확히 일치하는 헤더
            for (const col of COLUMNS) {
              if (col.key === key) {
                const val = raw[col.header] ?? raw[key] ?? "";
                return String(val).trim();
              }
            }
            return String(raw[key] ?? "").trim();
          };

          const title       = get("title");
          let   category    = get("category");
          const subcategory = get("subcategory");
          const priceStr    = get("price");
          const priceUnit   = get("priceUnit") || "건";
          const description = get("description");
          const badgeRaw    = get("badge");
          const tagsRaw     = get("tags");
          const industryRaw = get("industry");

          const errs: string[] = [];

          if (!title) errs.push("서비스명 필수");

          // 카테고리: 한글 레이블로 입력했을 경우도 허용
          if (!category) {
            errs.push("카테고리 필수");
          } else {
            if (!VALID_CATEGORIES.has(category)) {
              const mapped = CAT_LABEL_TO_ID[category];
              if (mapped) category = mapped;
              else errs.push(`카테고리 코드 오류: "${category}" (store/place/app/seo/sns/blog/ad/etc)`);
            }
          }

          const price = Number(priceStr);
          if (!priceStr || isNaN(price) || price <= 0)
            errs.push("가격 오류 (0보다 큰 숫자 필요)");
          if (priceUnit && !VALID_UNITS.has(priceUnit))
            errs.push(`단위 오류: "${priceUnit}"`);
          if (badgeRaw && !VALID_BADGE.has(badgeRaw))
            errs.push(`뱃지 오류: "${badgeRaw}"`);

          const tags = tagsRaw
            ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
            : [];

          const industry = industryRaw
            ? industryRaw.split(",").map((t) => t.trim()).filter(Boolean)
            : [];
          const invalidInd = industry.filter((i) => !VALID_INDUSTRIES.has(i));
          if (invalidInd.length)
            errs.push(`업종 코드 오류: ${invalidInd.join(", ")}`);

          if (errs.length) {
            errors.push({ row: rowNum, message: errs.join(" / ") });
            return;
          }

          ok.push({
            id:          `xl-${Date.now()}-${idx}`,
            title,
            category,
            subcategory,
            price,
            priceUnit,
            description,
            badge:       badgeRaw ? (badgeRaw as Service["badge"]) : undefined,
            tags,
            industry,
            rating:      5.0,
            reviewCount: 0,
          });
        });

        resolve({ ok, errors });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsBinaryString(file);
  });
}
