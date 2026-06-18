"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  X, Zap, CheckCircle2, ShieldCheck, Clock,
  ChevronDown, ChevronUp, Minus, Plus,
} from "lucide-react";

const TIERS = [
  { name: "스타터",   mult: 1,   desc: "입문자 추천 · 소규모 테스트" },
  { name: "스탠다드", mult: 2.5, desc: "꾸준한 성장 · 가장 인기" },
  { name: "프로",     mult: 6,   desc: "빠른 성장 · 대규모 진행" },
] as const;

type TierName = typeof TIERS[number]["name"];

interface Props {
  serviceId:   string;
  serviceName: string;
  category:    string;
  basePrice:   number;
  priceUnit:   string;
  isLoggedIn:  boolean;
  onClose:     () => void;
}

export default function QuickOrderModal({
  serviceId, serviceName, category, basePrice, priceUnit, isLoggedIn, onClose,
}: Props) {
  const router = useRouter();

  const [tier,          setTier]         = useState<TierName>("스탠다드");
  const [qty,           setQty]          = useState(1);
  const [requestUrl,    setRequestUrl]   = useState("");
  const [requestKwd,    setRequestKwd]   = useState("");
  const [requestMemo,   setRequestMemo]  = useState("");
  const [showExtra,     setShowExtra]    = useState(false);
  const [urlError,      setUrlError]     = useState("");
  const [loading,       setLoading]      = useState(false);
  const [success,       setSuccess]      = useState(false);
  const [apiError,      setApiError]     = useState("");

  const tierData  = TIERS.find((t) => t.name === tier)!;
  const unitPrice = Math.round(basePrice * tierData.mult);
  const total     = unitPrice * qty;

  // ESC 닫기
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  const handleQty = (delta: number) => {
    setQty((prev) => Math.max(1, Math.min(9999, prev + delta)));
  };

  const handleSubmit = async () => {
    if (!isLoggedIn) {
      router.push(`/login?callbackUrl=/services/${serviceId}`);
      return;
    }
    if (!requestUrl.trim()) {
      setUrlError("작업 대상 URL을 입력해주세요.");
      return;
    }

    setLoading(true);
    setApiError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          serviceName,
          tier,
          amount:         total,
          requestUrl:     requestUrl.trim(),
          requestKeyword: requestKwd.trim(),
          requestMemo:    requestMemo.trim(),
        }),
      });

      if (res.status === 401) { router.push("/login?callbackUrl=/services/" + serviceId); return; }
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error((d as { error?: string }).error ?? "주문 실패");
      }
      setSuccess(true);
      setTimeout(() => { onClose(); router.push("/dashboard"); }, 1600);
    } catch (e) {
      setApiError(e instanceof Error ? e.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full sm:max-w-lg bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">

        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-100 shrink-0">
          <div className="flex-1 min-w-0 pr-3">
            <p className="text-xs text-blue-600 font-semibold mb-0.5">{category}</p>
            <h2 className="text-base font-bold text-slate-900 leading-snug line-clamp-2">{serviceName}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 transition-colors shrink-0"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-5 space-y-4">

          {/* 티어 선택 */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-700">플랜 선택</p>
            <div className="grid grid-cols-3 gap-2">
              {TIERS.map((t) => (
                <button
                  key={t.name}
                  onClick={() => setTier(t.name)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    tier === t.name
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <p className={`text-xs font-bold ${tier === t.name ? "text-blue-700" : "text-slate-800"}`}>
                    {t.name}
                  </p>
                  <p className={`text-[11px] mt-0.5 ${tier === t.name ? "text-blue-600" : "text-slate-400"}`}>
                    {Math.round(basePrice * t.mult).toLocaleString()}원~/{priceUnit}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* 수량 + 실시간 금액 */}
          <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-700">수량</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleQty(-1)}
                  className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5 text-slate-600" />
                </button>
                <input
                  type="number"
                  min={1}
                  max={9999}
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, Math.min(9999, parseInt(e.target.value) || 1)))}
                  className="w-16 text-center text-sm font-bold border border-slate-200 rounded-lg py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
                <button
                  onClick={() => handleQty(1)}
                  className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-slate-600" />
                </button>
              </div>
            </div>

            {/* 금액 계산 */}
            <div className="border-t border-slate-200 pt-3">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                <span>단가</span>
                <span>{unitPrice.toLocaleString()}원/{priceUnit}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span>수량</span>
                <span>{qty.toLocaleString()}건</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">예상 금액</span>
                <span className="text-xl font-bold text-blue-600">{total.toLocaleString()}원~</span>
              </div>
            </div>
          </div>

          {/* 작업 URL (필수) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              작업 대상 URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={requestUrl}
              onChange={(e) => { setRequestUrl(e.target.value); setUrlError(""); }}
              placeholder="https://smartstore.naver.com/..."
              className={`w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                urlError ? "border-red-300 bg-red-50" : "border-slate-200 bg-white"
              }`}
            />
            {urlError && <p className="text-[11px] text-red-500 mt-1">{urlError}</p>}
            <p className="text-[11px] text-slate-400 mt-1">플레이스, 스마트스토어, 유튜브, 앱스토어 등</p>
          </div>

          {/* 추가 요청사항 (접을 수 있음) */}
          <button
            onClick={() => setShowExtra(!showExtra)}
            className="w-full flex items-center justify-between text-xs text-slate-500 hover:text-slate-700 transition-colors py-1"
          >
            <span>추가 요청사항 (선택)</span>
            {showExtra ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showExtra && (
            <div className="space-y-2.5 -mt-1">
              <input
                type="text"
                value={requestKwd}
                onChange={(e) => setRequestKwd(e.target.value)}
                placeholder="목표 키워드 (예: 강남 맛집)"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                value={requestMemo}
                onChange={(e) => setRequestMemo(e.target.value)}
                placeholder="특이사항·추가 요청사항"
                rows={2}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          )}

          {/* API 오류 */}
          {apiError && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              {apiError}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 space-y-3 shrink-0 bg-white">
          {/* 보증 문구 */}
          <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-green-500" />실사용자 100%</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-blue-500" />24h 내 시작</span>
          </div>

          {/* 주문 버튼 */}
          <button
            onClick={handleSubmit}
            disabled={loading || success}
            className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-base transition-colors ${
              success
                ? "bg-green-600 text-white"
                : loading
                ? "bg-blue-400 text-white cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {success ? (
              <><CheckCircle2 className="w-5 h-5" />주문 완료! 마이페이지로 이동 중...</>
            ) : loading ? (
              <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />처리 중...</>
            ) : (
              <><Zap className="w-5 h-5" />{isLoggedIn ? `${total.toLocaleString()}원 바로 주문` : "로그인 후 주문하기"}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
