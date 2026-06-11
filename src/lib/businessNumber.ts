/**
 * 사업자등록번호 유효성 검사 유틸
 *
 * 1. 형식 검사: XXX-XX-XXXXX (10자리 숫자)
 * 2. 체크섬 검증: 국세청 공개 알고리즘
 * 3. (선택) 국세청 API 실시간 상태 조회
 */

// ── 체크섬 검증 ──────────────────────────────────────────

export function validateBusinessNumberFormat(raw: string): boolean {
  const digits = raw.replace(/-/g, "");
  if (!/^\d{10}$/.test(digits)) return false;

  // 국세청 체크섬 알고리즘
  const weights = [1, 3, 7, 1, 3, 7, 1, 3, 5];
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits[i]) * weights[i];
  }
  // 9번째 자리(index 8)는 *5 후 십의 자리도 합산
  sum += Math.floor((parseInt(digits[8]) * 5) / 10);

  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === parseInt(digits[9]);
}

/** XXX-XX-XXXXX 형식으로 포맷팅 */
export function formatBusinessNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
}

// ── 국세청 API 상태 조회 ──────────────────────────────────

export type NtsBusinessStatus = {
  isValid:      boolean;
  status:       string;       // "계속사업자" | "휴업자" | "폐업자" | "등록되지 않은 사업자"
  statusCode:   string;       // "01" | "02" | "03" | ""
  taxType:      string;
  isActive:     boolean;      // 계속사업자 여부
  source:       "nts_api" | "checksum_only";
};

export async function verifyBusinessNumberWithNts(
  businessNumber: string
): Promise<NtsBusinessStatus> {
  const digits = businessNumber.replace(/-/g, "");

  // 형식 검증 먼저
  if (!validateBusinessNumberFormat(businessNumber)) {
    return {
      isValid:    false,
      status:     "잘못된 사업자등록번호 형식",
      statusCode: "",
      taxType:    "",
      isActive:   false,
      source:     "checksum_only",
    };
  }

  const serviceKey = process.env.NTS_SERVICE_KEY;

  // API 키 없으면 체크섬만 검증
  if (!serviceKey) {
    return {
      isValid:    true,
      status:     "형식 검증 완료 (API 키 미설정 — 실제 사업자 여부 미확인)",
      statusCode: "checksum",
      taxType:    "",
      isActive:   true,   // 체크섬 통과 시 일단 허용
      source:     "checksum_only",
    };
  }

  try {
    const url = `https://api.odcloud.kr/api/nts-businessman/v1/status?serviceKey=${encodeURIComponent(serviceKey)}`;
    const res = await fetch(url, {
      method:  "POST",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      body:    JSON.stringify({ b_no: [digits] }),
      signal:  AbortSignal.timeout(5000), // 5초 타임아웃
    });

    if (!res.ok) throw new Error(`NTS API ${res.status}`);

    const json = await res.json();
    const item = json?.data?.[0];

    if (!item) throw new Error("NTS API: 빈 응답");

    const statusMap: Record<string, string> = {
      "01": "계속사업자",
      "02": "휴업자",
      "03": "폐업자",
    };

    const statusCode = item.b_stt_cd ?? "";
    const status     = statusMap[statusCode] ?? item.b_stt ?? "알 수 없음";
    const isActive   = statusCode === "01";

    return {
      isValid:    true,
      status,
      statusCode,
      taxType:    item.tax_type ?? "",
      isActive,
      source:     "nts_api",
    };
  } catch (err) {
    console.error("[NTS API Error]", err);
    // API 오류 시 체크섬만 통과한 것으로 처리 (서비스 중단 방지)
    return {
      isValid:    true,
      status:     "국세청 API 일시 오류 — 체크섬 검증 통과",
      statusCode: "api_error",
      taxType:    "",
      isActive:   true,
      source:     "checksum_only",
    };
  }
}
