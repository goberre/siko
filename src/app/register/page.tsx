"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { getPasswordStrength } from "@/lib/validations";
import { formatBusinessNumber } from "@/lib/businessNumber";
import {
  Zap, Eye, EyeOff, CheckCircle2, XCircle,
  Loader2, ArrowRight, ShieldCheck, Building2,
  Search, AlertCircle, TriangleAlert,
} from "lucide-react";

type FieldErrors = Partial<Record<string, string>>;

const pwReqs = [
  { key: "len",  label: "8자 이상",     test: (p: string) => p.length >= 8 },
  { key: "up",   label: "대문자 포함",   test: (p: string) => /[A-Z]/.test(p) },
  { key: "lo",   label: "소문자 포함",   test: (p: string) => /[a-z]/.test(p) },
  { key: "num",  label: "숫자 포함",     test: (p: string) => /[0-9]/.test(p) },
  { key: "spc",  label: "특수문자 포함", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

type BizStatus = {
  verified: boolean;
  status:   string;
  taxType:  string;
  error:    string;
  source:   string;
};

export default function RegisterPage() {
  const router = useRouter();

  // ── 폼 상태 ──────────────────────────────────────────────
  const [form, setForm] = useState({
    name:            "",
    email:           "",
    phone:           "",
    businessNumber:  "",
    businessName:    "",
    password:        "",
    confirmPassword: "",
    agreeTerms:      false,
    agreeOwnBiz:     false,   // 본인 사업자 사용 동의
  });
  const [biz, setBiz]           = useState<BizStatus>({ verified: false, status: "", taxType: "", error: "", source: "" });
  const [bizLoading, setBizLoading] = useState(false);
  const [showPw, setShowPw]     = useState(false);
  const [showCPw, setShowCPw]   = useState(false);
  const [errors, setErrors]     = useState<FieldErrors>({});
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [serverError, setServerError] = useState("");

  const strength = getPasswordStrength(form.password);

  const set = (key: string, value: string | boolean) => {
    if (key === "businessNumber") {
      const formatted = formatBusinessNumber(value as string);
      setForm((f) => ({ ...f, businessNumber: formatted }));
      setBiz({ verified: false, status: "", taxType: "", error: "", source: "" });
    } else {
      setForm((f) => ({ ...f, [key]: value }));
    }
    setErrors((e) => ({ ...e, [key]: undefined }));
    setServerError("");
  };

  // ── 사업자등록번호 인증 ───────────────────────────────────
  const verifyBusiness = async () => {
    if (!form.businessNumber) {
      setErrors((e) => ({ ...e, businessNumber: "사업자등록번호를 입력해주세요" }));
      return;
    }
    setBizLoading(true);
    setBiz({ verified: false, status: "", taxType: "", error: "", source: "" });

    try {
      const res  = await fetch("/api/verify-business", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ businessNumber: form.businessNumber }),
      });
      const data = await res.json();

      if (!res.ok || !data.valid) {
        setBiz({ verified: false, status: "", taxType: "", error: data.error ?? "인증 실패", source: "" });
      } else {
        setBiz({
          verified: true,
          status:   data.status,
          taxType:  data.taxType,
          error:    "",
          source:   data.source,
        });
        if (data.formatted) setForm((f) => ({ ...f, businessNumber: data.formatted }));
      }
    } catch {
      setBiz({ verified: false, status: "", taxType: "", error: "네트워크 오류", source: "" });
    } finally {
      setBizLoading(false);
    }
  };

  // ── 가입 제출 ─────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!biz.verified) {
      setErrors((err) => ({ ...err, businessVerified: "사업자등록번호 인증을 먼저 완료해주세요" }));
      return;
    }
    if (!form.agreeOwnBiz) {
      setErrors((err) => ({ ...err, agreeOwnBiz: "본인 사업자등록증 사용에 동의해주세요" }));
      return;
    }
    setLoading(true);
    setErrors({});
    setServerError("");

    try {
      const res  = await fetch("/api/register", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ ...form, businessVerified: true }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.field) setErrors({ [data.field]: data.error });
        else setServerError(data.error ?? "오류가 발생했습니다");
        return;
      }

      setSuccess(true);
      await signIn("credentials", {
        email:    form.email,
        password: form.password,
        redirect: false,
      });
      setTimeout(() => router.push("/"), 1200);
    } catch {
      setServerError("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">가입 완료!</h2>
          <p className="text-sm text-slate-500">잠시 후 홈으로 이동합니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        {/* 로고 */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <Zap className="w-[18px] h-[18px] text-white" fill="white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">SIKO</span>
          </Link>
          <h1 className="text-xl font-bold text-slate-900">사업자 회원가입</h1>
          <p className="text-sm text-slate-500 mt-1">
            이미 계정이 있으신가요?{" "}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">로그인</Link>
          </p>
        </div>

        {/* 가입 안내 배너 */}
        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl mb-3">
          <Building2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-800">사업자 전용 서비스</p>
            <p className="text-xs text-blue-600 mt-0.5">
              SIKO는 사업자등록번호 인증을 완료한 업체만 이용 가능합니다.
              국세청 API를 통해 실시간으로 사업자 등록 여부를 검증합니다.
            </p>
          </div>
        </div>

        {/* 법적 경고 배너 */}
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-300 rounded-xl mb-6">
          <TriangleAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">타인의 사업자등록번호 사용 금지</p>
            <p className="text-xs text-red-600 mt-1 leading-relaxed">
              본인 명의가 아닌 타기업·타인의 사업자등록번호를 무단으로 사용하는 행위는
              <strong className="text-red-700"> 「전자서명법」·「정보통신망법」 위반</strong>으로
              형사처벌(3년 이하 징역 또는 3천만원 이하 벌금) 대상입니다.
            </p>
            <p className="text-xs text-red-500 mt-1">
              SIKO는 정기적으로 국세청 API를 통해 사업자 상태를 재검증하며,
              도용 사실 확인 시 즉시 계정 정지 및 수사기관에 신고합니다.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-7 shadow-sm">
          {serverError && (
            <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl mb-5 text-sm text-red-700">
              <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* ─── STEP 1: 사업자 인증 ────────────────────── */}
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                STEP 1 · 사업자 인증
              </p>

              <Field label="사업자등록번호" error={errors.businessNumber} required>
                <div className="flex gap-2">
                  <input
                    value={form.businessNumber}
                    onChange={(e) => set("businessNumber", e.target.value)}
                    placeholder="000-00-00000"
                    maxLength={12}
                    className={`${inputCls(!!errors.businessNumber)} flex-1`}
                    disabled={biz.verified}
                  />
                  <button
                    type="button"
                    onClick={verifyBusiness}
                    disabled={bizLoading || biz.verified}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-semibold rounded-xl transition-colors whitespace-nowrap"
                  >
                    {bizLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : biz.verified ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                    {biz.verified ? "인증완료" : "인증하기"}
                  </button>
                </div>

                {/* 인증 결과 */}
                {biz.verified && (
                  <div className="flex items-center gap-2 mt-2 p-2.5 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-green-700">{biz.status}</p>
                      {biz.taxType && (
                        <p className="text-[11px] text-green-600">{biz.taxType}</p>
                      )}
                      {biz.source === "checksum_only" && (
                        <p className="text-[11px] text-amber-600">* API 키 미설정 — 형식 검증만 수행됨</p>
                      )}
                    </div>
                  </div>
                )}
                {biz.error && (
                  <div className="flex items-center gap-2 mt-2 p-2.5 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <p className="text-xs text-red-700">{biz.error}</p>
                  </div>
                )}
                {errors.businessVerified && (
                  <p className="text-xs text-red-500 mt-1">{errors.businessVerified}</p>
                )}
              </Field>

              <Field label="상호명" error={errors.businessName} required>
                <input
                  value={form.businessName}
                  onChange={(e) => set("businessName", e.target.value)}
                  placeholder="사업자등록증상 상호명"
                  className={inputCls(!!errors.businessName)}
                />
              </Field>
            </div>

            <div className="border-t border-slate-100 pt-5 space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                STEP 2 · 계정 정보
              </p>

              <Field label="담당자 이름" error={errors.name} required>
                <input
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="홍길동"
                  className={inputCls(!!errors.name)}
                />
              </Field>

              <Field label="이메일" error={errors.email} required>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="example@company.com"
                  className={inputCls(!!errors.email)}
                />
              </Field>

              <Field label="전화번호" error={errors.phone}>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="010-0000-0000"
                  className={inputCls(!!errors.phone)}
                />
              </Field>
            </div>

            <div className="border-t border-slate-100 pt-5 space-y-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                STEP 3 · 비밀번호 설정
              </p>

              <Field label="비밀번호" error={errors.password} required>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => set("password", e.target.value)}
                    placeholder="대문자·소문자·숫자·특수문자 포함"
                    className={`${inputCls(!!errors.password)} pr-10`}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {form.password && (
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < strength.score ? strength.color : "bg-slate-100"}`} />
                        ))}
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500 w-16 text-right">{strength.label}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                      {pwReqs.map((req) => {
                        const ok = req.test(form.password);
                        return (
                          <div key={req.key} className={`flex items-center gap-1.5 text-[11px] font-medium ${ok ? "text-green-600" : "text-slate-400"}`}>
                            {ok ? <CheckCircle2 className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-slate-300" />}
                            {req.label}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Field>

              <Field label="비밀번호 확인" error={errors.confirmPassword} required>
                <div className="relative">
                  <input
                    type={showCPw ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={(e) => set("confirmPassword", e.target.value)}
                    placeholder="비밀번호를 다시 입력해주세요"
                    className={`${inputCls(!!errors.confirmPassword)} pr-10`}
                  />
                  <button type="button" onClick={() => setShowCPw(!showCPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showCPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  {form.confirmPassword && form.password === form.confirmPassword && (
                    <CheckCircle2 className="absolute right-9 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                  )}
                </div>
              </Field>
            </div>

            {/* 약관 동의 */}
            <div className="border-t border-slate-100 pt-4 space-y-3">
              {/* 본인 사업자 사용 동의 */}
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.agreeOwnBiz}
                    onChange={(e) => set("agreeOwnBiz", e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-red-600 rounded shrink-0"
                  />
                  <span className="text-xs text-red-700 leading-relaxed">
                    <strong>본인 명의의 사업자등록번호만 사용</strong>하며, 타인 또는 타기업의 사업자등록번호를
                    무단 도용하지 않겠습니다. 위반 시 법적 책임을 감수합니다.
                    <span className="text-red-500 ml-1">*</span>
                  </span>
                </label>
                {errors.agreeOwnBiz && (
                  <p className="text-xs text-red-500 mt-1.5 ml-7">{errors.agreeOwnBiz}</p>
                )}
              </div>

              {/* 이용약관 동의 */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.agreeTerms}
                  onChange={(e) => set("agreeTerms", e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-blue-600 rounded"
                />
                <span className="text-sm text-slate-600">
                  <Link href="/terms"   className="text-blue-600 hover:underline">이용약관</Link>
                  {" "}및{" "}
                  <Link href="/privacy" className="text-blue-600 hover:underline">개인정보처리방침</Link>
                  에 동의합니다 <span className="text-red-400">*</span>
                </span>
              </label>
              {errors.agreeTerms && (
                <p className="text-xs text-red-500 mt-1 ml-7">{errors.agreeTerms}</p>
              )}
            </div>

            {/* 제출 */}
            <button
              type="submit"
              disabled={loading || !biz.verified}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold rounded-xl transition-colors"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> 가입 중...</>
              ) : (
                <>가입 완료하기 <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
        </div>

        <div className="flex items-center justify-center gap-1.5 mt-5 text-xs text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          사업자 정보는 국세청 API로 검증되며, 비밀번호는 bcrypt로 암호화됩니다
        </div>
      </div>
    </div>
  );
}

const inputCls = (hasError: boolean) =>
  `w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
    hasError
      ? "border-red-300 focus:ring-red-200 bg-red-50"
      : "border-slate-200 focus:ring-blue-200 focus:border-blue-400"
  }`;

function Field({
  label, error, required, children,
}: { label: string; error?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-slate-700">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
