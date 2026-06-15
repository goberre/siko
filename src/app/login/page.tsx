"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Zap, Eye, EyeOff, Loader2, ArrowRight, AlertCircle, ShieldCheck, Lock } from "lucide-react";

const errorMessages: Record<string, string> = {
  CredentialsSignin: "이메일 또는 비밀번호가 올바르지 않습니다",
  Default:           "로그인 중 오류가 발생했습니다",
};

function sanitizeCallbackUrl(url: string | null): string {
  if (!url) return "/";
  try {
    // 같은 오리진이 아닌 경우 홈으로 fallback (오픈 리다이렉트 방어)
    const parsed = new URL(url, window.location.origin);
    if (parsed.origin !== window.location.origin) return "/";
    return parsed.pathname + parsed.search;
  } catch {
    // 상대 경로면 그대로
    if (url.startsWith("/") && !url.startsWith("//")) return url;
    return "/";
  }
}

function LoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl  = searchParams.get("callbackUrl");
  const urlError     = searchParams.get("error");

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [locked, setLocked]     = useState(false);
  const [lockedMins, setLockedMins] = useState(0);
  const [error, setError]       = useState(
    urlError ? (errorMessages[urlError] ?? errorMessages.Default) : ""
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("이메일과 비밀번호를 모두 입력해주세요");
      return;
    }

    setLoading(true);
    setError("");
    setLocked(false);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(errorMessages.CredentialsSignin);
        setLoading(false);
        return;
      }

      // 성공 — 강제 새로고침으로 세션 반영
      const safe = sanitizeCallbackUrl(callbackUrl);
      window.location.href = safe;
    } catch {
      setError(errorMessages.Default);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <Zap className="w-[18px] h-[18px] text-white" fill="white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">SIKO</span>
          </Link>
          <h1 className="text-xl font-bold text-slate-900">로그인</h1>
          <p className="text-sm text-slate-500 mt-1">
            계정이 없으신가요?{" "}
            <Link href="/register" className="text-blue-600 hover:underline font-medium">
              사업자 회원가입
            </Link>
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-7 shadow-sm">
          {/* 계정 잠금 알림 */}
          {locked && (
            <div className="flex items-start gap-2.5 p-4 bg-red-50 border border-red-200 rounded-xl mb-5">
              <Lock className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-800">계정이 잠겼습니다</p>
                <p className="text-xs text-red-600 mt-0.5">
                  로그인 실패가 5회 누적되어 보안을 위해 계정이 잠겼습니다.
                  <strong> {lockedMins}분 후</strong>에 다시 시도해주세요.
                </p>
              </div>
            </div>
          )}

          {/* 일반 오류 */}
          {error && !locked && (
            <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl mb-5 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); setLocked(false); }}
                placeholder="example@company.com"
                autoComplete="email"
                disabled={locked}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">비밀번호</label>
                <Link href="/forgot-password" className="text-[11px] text-blue-600 hover:underline">
                  비밀번호 찾기
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="비밀번호 입력"
                  autoComplete="current-password"
                  disabled={locked}
                  className="w-full px-4 py-2.5 pr-10 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all disabled:bg-slate-50"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || locked}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold rounded-xl transition-colors mt-2"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> 로그인 중...</>
              ) : locked ? (
                <><Lock className="w-4 h-4" /> 계정 잠금됨</>
              ) : (
                <>로그인 <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
        </div>

        <div className="flex items-center justify-center gap-1.5 mt-5 text-xs text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          5회 실패 시 30분 계정 잠금 · 모든 데이터 암호화 전송
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
