"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Zap, Eye, EyeOff, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { getPasswordStrength } from "@/lib/validations";

const pwReqs = [
  { label: "8자 이상",     test: (p: string) => p.length >= 8 },
  { label: "대문자 포함",   test: (p: string) => /[A-Z]/.test(p) },
  { label: "소문자 포함",   test: (p: string) => /[a-z]/.test(p) },
  { label: "숫자 포함",     test: (p: string) => /[0-9]/.test(p) },
  { label: "특수문자 포함", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

function ResetForm() {
  const params   = useSearchParams();
  const router   = useRouter();
  const token    = params.get("token") ?? "";
  const email    = params.get("email") ?? "";

  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [done,     setDone]     = useState(false);

  const strength = getPasswordStrength(password);

  if (!token || !email) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-900 mb-2">유효하지 않은 링크</h2>
          <p className="text-sm text-slate-500 mb-4">비밀번호 재설정 링크가 잘못되었습니다.</p>
          <Link href="/forgot-password" className="text-blue-600 hover:underline text-sm">다시 요청하기</Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-900 mb-2">비밀번호가 변경되었습니다</h2>
          <p className="text-sm text-slate-500 mb-4">새 비밀번호로 로그인해주세요.</p>
          <Link href="/login" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
            로그인하기
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("비밀번호가 일치하지 않습니다"); return; }
    if (strength.score < 4) { setError("비밀번호 강도가 부족합니다. 모든 조건을 충족해주세요"); return; }

    setLoading(true);
    setError("");

    const res  = await fetch("/api/auth/reset-password", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ token, email, password }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError(data.error ?? "오류가 발생했습니다"); return; }
    setDone(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <Zap className="w-[18px] h-[18px] text-white" fill="white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">SIKO</span>
          </Link>
          <h1 className="text-xl font-bold text-slate-900">새 비밀번호 설정</h1>
          <p className="text-xs text-slate-400 mt-1">{email}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-7 shadow-sm">
          {error && <p className="text-sm text-red-600 mb-4 p-3 bg-red-50 rounded-lg">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">새 비밀번호 <span className="text-red-400">*</span></label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="새 비밀번호"
                  className="w-full px-4 py-2.5 pr-10 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full ${i < strength.score ? strength.color : "bg-slate-100"}`} />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {pwReqs.map((req) => {
                      const ok = req.test(password);
                      return (
                        <div key={req.label} className={`flex items-center gap-1 text-[11px] ${ok ? "text-green-600" : "text-slate-400"}`}>
                          {ok ? <CheckCircle2 className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-slate-300" />}
                          {req.label}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">비밀번호 확인 <span className="text-red-400">*</span></label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => { setConfirm(e.target.value); setError(""); }}
                placeholder="비밀번호 재입력"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white font-semibold rounded-xl transition-colors"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> 변경 중...</> : "비밀번호 변경"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return <Suspense><ResetForm /></Suspense>;
}
