"use client";

import { useState } from "react";
import Link from "next/link";
import { Zap, ArrowRight, Loader2, CheckCircle2, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError("이메일을 입력해주세요"); return; }
    setLoading(true);
    setError("");

    await fetch("/api/auth/forgot-password", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email }),
    });

    // 이메일 존재 여부 노출 방지 — 항상 성공 표시
    setLoading(false);
    setSent(true);
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-7 h-7 text-blue-500" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">이메일을 확인해주세요</h2>
          <p className="text-sm text-slate-500 mb-6">
            <strong>{email}</strong>로 비밀번호 재설정 링크를 발송했습니다.
            이메일이 없다면 스팸함을 확인해주세요.
          </p>
          <p className="text-xs text-slate-400 mb-6">링크는 1시간 동안 유효합니다.</p>
          <Link href="/login" className="text-sm text-blue-600 hover:underline">로그인으로 돌아가기</Link>
        </div>
      </div>
    );
  }

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
          <h1 className="text-xl font-bold text-slate-900">비밀번호 찾기</h1>
          <p className="text-sm text-slate-500 mt-1">가입한 이메일로 재설정 링크를 보내드립니다</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-7 shadow-sm">
          {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="가입한 이메일 주소"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold rounded-xl transition-colors"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> 발송 중...</> : <>재설정 링크 받기 <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        </div>
        <div className="text-center mt-5">
          <Link href="/login" className="text-sm text-slate-500 hover:text-slate-800">← 로그인으로 돌아가기</Link>
        </div>
      </div>
    </div>
  );
}
