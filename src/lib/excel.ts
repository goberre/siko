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

/* ── 컬럼 정의 (CSV 순서) ──────────────────────────────
   서비스명 / 카테고리 / 세부분류 / 가격 / 단위 / 설명 / 뱃지 / 태그 / 업종 */
export const COLUMNS = [
  { key: "title",       header: "서비스명" },
  { key: "category",    header: "카테고리" },
  { key: "subcategory", header: "세부분류" },
  { key: "price",       header: "기본가격(원)" },
  { key: "priceUnit",   header: "단위" },
  { key: "description", header: "서비스설명" },
  { key: "badge",       header: "뱃지" },
  { key: "tags",        header: "태그" },
  { key: "industry",    header: "업종" },
];

/* ══════════════════════════════════════════════════════
   CSV 파싱 (업로드)
══════════════════════════════════════════════════════ */
export type ParseResult = {
  ok: Service[];
  errors: { row: number; message: string }[];
};

const VALID_CATEGORIES = new Set(CATEGORY_OPTIONS.map((c) => c.id));
const VALID_BADGE      = new Set(BADGE_OPTIONS);
const VALID_UNITS      = new Set(UNIT_OPTIONS);
const VALID_INDUSTRIES = new Set(INDUSTRY_OPTIONS.map((i) => i.id));

const CAT_LABEL_TO_ID: Record<string, string> = Object.fromEntries(
  CATEGORY_OPTIONS.map((c) => [c.label, c.id])
);

/** 따옴표·쉼표·줄바꿈을 처리하는 CSV 파서 */
function parseCsv(text: string): string[][] {
  // BOM 제거
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);

  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }   // 이스케이프된 따옴표
        else inQuotes = false;
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        row.push(field); field = "";
      } else if (ch === "\n") {
        row.push(field); field = "";
        rows.push(row); row = [];
      } else if (ch === "\r") {
        // CRLF의 \r 무시
      } else {
        field += ch;
      }
    }
  }
  // 마지막 필드/행
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

export function parseExcel(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = String(e.target?.result ?? "");
        const matrix = parseCsv(text).filter((r) => r.some((c) => c.trim() !== ""));

        if (matrix.length === 0) {
          resolve({ ok: [], errors: [{ row: 0, message: "빈 파일입니다" }] });
          return;
        }

        // 첫 행이 헤더인지 판단 ("서비스명" 포함 시 헤더로 간주)
        const firstRow = matrix[0].map((c) => c.trim());
        const hasHeader = firstRow.some((c) => c.includes("서비스명") || c.toLowerCase().includes("title"));
        const dataRows  = hasHeader ? matrix.slice(1) : matrix;

        const ok: Service[] = [];
        const errors: { row: number; message: string }[] = [];

        dataRows.forEach((cells, idx) => {
          const rowNum = idx + (hasHeader ? 2 : 1);

          const title       = (cells[0] ?? "").trim();
          let   category    = (cells[1] ?? "").trim();
          const subcategory = (cells[2] ?? "").trim();
          const priceStr    = (cells[3] ?? "").trim().replace(/,/g, "");
          const priceUnit   = (cells[4] ?? "").trim() || "건";
          const description = (cells[5] ?? "").trim();
          const badgeRaw    = (cells[6] ?? "").trim();
          const tagsRaw     = (cells[7] ?? "").trim();
          const industryRaw = (cells[8] ?? "").trim();

          // 완전히 빈 행은 건너뜀
          if (!title && !category && !priceStr) return;

          const errs: string[] = [];

          if (!title) errs.push("서비스명 필수");

          if (!category) {
            errs.push("카테고리 필수");
          } else if (!VALID_CATEGORIES.has(category)) {
            const mapped = CAT_LABEL_TO_ID[category];
            if (mapped) category = mapped;
            else errs.push(`카테고리 코드 오류: "${category}" (store/place/app/seo/sns/blog/ad/etc)`);
          }

          const price = Number(priceStr);
          if (!priceStr || isNaN(price) || price <= 0)
            errs.push("가격 오류 (0보다 큰 숫자 필요)");
          if (priceUnit && !VALID_UNITS.has(priceUnit))
            errs.push(`단위 오류: "${priceUnit}"`);
          if (badgeRaw && !VALID_BADGE.has(badgeRaw))
            errs.push(`뱃지 오류: "${badgeRaw}"`);

          const tags = tagsRaw
            ? tagsRaw.split(/[,;]/).map((t) => t.trim()).filter(Boolean)
            : [];

          const industry = industryRaw
            ? industryRaw.split(/[,;]/).map((t) => t.trim()).filter(Boolean)
            : [];
          const invalidInd = industry.filter((i) => !VALID_INDUSTRIES.has(i));
          if (invalidInd.length)
            errs.push(`업종 코드 오류: ${invalidInd.join(", ")}`);

          if (errs.length) {
            errors.push({ row: rowNum, message: errs.join(" / ") });
            return;
          }

          ok.push({
            id:          `csv-${Date.now()}-${idx}`,
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
    reader.readAsText(file, "UTF-8");
  });
}
