"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  X, Zap, CheckCircle2, ShieldCheck, Clock,
  ChevronDown, ChevronUp, Minus, Plus, ShoppingCart, Trash2, ArrowRight,
} from "lucide-react";
import { useCart } from "@/lib/cartContext";

const TIERS = [
  { name: "스타터",   mult: 1,   desc: "입문 · 소규모 테스트" },
  { name: "스탠다드", mult: 2.5, desc: "가장 인기 · 꾸준한 성장" },
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
  const { items, setQty, removeItem, totalCount } = useCart();

  const [tier,        setTier]       = useState<TierName>("스탠다드");
  const [qty,         setQtyState]   = useState(1);
  const [requestUrl,  setRequestUrl] = useState("");
  const [requestKwd,  setRequestKwd] = useState("");
  const [requestMemo, setRequestMemo] = useState("");
  const [showExtra,   setShowExtra]  = useState(false);
  const [urlError,    setUrlError]   = useState("");
  const [loading,     setLoading]    = useState(false);
  const [success,     setSuccess]    = useState(false);
  const [apiError,    setApiError]   = useState("");

  const tierData  = TIERS.find((t) => t.name === tier)!;
  const unitPrice = Math.round(basePrice * tierData.mult);
  const thisTotal = unitPrice * qty;

  // 장바구니 합계 (현재 모달 항목 + 기존 장바구니)
  const cartSubtotal = items.reduce((s, i) => s + i.unitPrice * i.qty, 0);
  const grandTotal   = thisTotal + cartSubtotal;
  const discount     = Math.round(grandTotal * 0.05);

  const handleQty = (delta: number) =>
    setQtyState((p) => Math.max(1, Math.min(9999, p + delta)));

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
          amount:         thisTotal,
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
      setTimeout(() => { onClose(); router.push("/dashboard"); }, 1400);
    } catch (e) {
      setApiError(e instanceof Error ? e.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const goToCart = () => { onClose(); router.push("/cart"); };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* 배경 */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* 모달 — 장바구니 있으면 2컬럼, 없으면 1컬럼 */}
      <div className={`relative w-full bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col ${
        items.length > 0 ? "sm:max-w-3xl" : "sm:max-w-lg"
      }`}>

        {/* 헤더 */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <div className="flex-1 min-w-0 pr-3">
            <p className="text-xs text-blue-600 font-semibold mb-0.5">{category}</p>
            <h2 className="text-base font-bold text-slate-900 leading-snug line-clamp-1">{serviceName}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-100 transition-colors shrink-0">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* 바디 — 2컬럼 레이아웃 */}
        <div className="flex flex-col sm:flex-row overflow-hidden flex-1 min-h-0">

          {/* ── 왼쪽: 주문 폼 ── */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 min-w-0">

            {/* 티어 선택 */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">플랜 선택</p>
              <div className="grid grid-cols-3 gap-2">
                {TIERS.map((t) => (
                  <button
                    key={t.name}
                    onClick={() => setTier(t.name)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      tier === t.name ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <p className={`text-xs font-bold ${tier === t.name ? "text-blue-700" : "text-slate-800"}`}>{t.name}</p>
                    <p className={`text-[11px] mt-0.5 ${tier === t.name ? "text-blue-600" : "text-slate-400"}`}>
                      {Math.round(basePrice * t.mult).toLocaleString()}원/{priceUnit}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* 수량 + 실시간 금액 */}
            <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-700">수량</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleQty(-1)} className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors">
                    <Minus className="w-3.5 h-3.5 text-slate-600" />
                  </button>
                  <input
                    type="number" min={1} max={9999} value={qty}
                    onChange={(e) => setQtyState(Math.max(1, Math.min(9999, parseInt(e.target.value) || 1)))}
                    className="w-16 text-center text-sm font-bold border border-slate-200 rounded-lg py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                  <button onClick={() => handleQty(1)} className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors">
                    <Plus className="w-3.5 h-3.5 text-slate-600" />
                  </button>
                </div>
              </div>
              <div className="border-t border-slate-200 pt-3 space-y-1.5">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>단가</span><span>{unitPrice.toLocaleString()}원/{priceUnit}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>수량</span><span>{qty.toLocaleString()}건</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-sm font-bold text-slate-900">이 상품 금액</span>
                  <span className="text-xl font-bold text-blue-600">{thisTotal.toLocaleString()}원~</span>
                </div>
              </div>
            </div>

            {/* 작업 URL */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                작업 대상 URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url" value={requestUrl}
                onChange={(e) => { setRequestUrl(e.target.value); setUrlError(""); }}
                placeholder="https://smartstore.naver.com/..."
                className={`w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  urlError ? "border-red-300 bg-red-50" : "border-slate-200 bg-white"
                }`}
              />
              {urlError && <p className="text-[11px] text-red-500 mt-1">{urlError}</p>}
              <p className="text-[11px] text-slate-400 mt-1">플레이스, 스마트스토어, 유튜브, 앱스토어 등</p>
            </div>

            {/* 추가 요청사항 */}
            <button
              onClick={() => setShowExtra(!showExtra)}
              className="w-full flex items-center justify-between text-xs text-slate-500 hover:text-slate-700 py-1 transition-colors"
            >
              <span>추가 요청사항 (선택)</span>
              {showExtra ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showExtra && (
              <div className="space-y-2.5">
                <input
                  type="text" value={requestKwd}
                  onChange={(e) => setRequestKwd(e.target.value)}
                  placeholder="목표 키워드 (예: 강남 맛집)"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  value={requestMemo} onChange={(e) => setRequestMemo(e.target.value)}
                  placeholder="특이사항·추가 요청사항" rows={2}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            )}

            {apiError && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{apiError}</p>
            )}
          </div>

          {/* ── 오른쪽: 장바구니 패널 (있을 때만) ── */}
          {items.length > 0 && (
            <div className="sm:w-72 bg-slate-50 sm:border-l border-t sm:border-t-0 border-slate-100 flex flex-col shrink-0 max-h-80 sm:max-h-none">
              {/* 패널 헤더 */}
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-bold text-slate-700">장바구니</span>
                  <span className="text-[11px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded-full">
                    {totalCount}
                  </span>
                </div>
                <button
                  onClick={goToCart}
                  className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-0.5"
                >
                  전체보기 <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* 장바구니 아이템 목록 */}
              <div className="overflow-y-auto flex-1 px-3 py-2 space-y-2">
                {items.map((item) => (
                  <div key={item.cartKey} className="bg-white rounded-xl p-3 border border-slate-100">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-xs font-semibold text-slate-800 line-clamp-2 flex-1">{item.serviceName}</p>
                      <button
                        onClick={() => removeItem(item.cartKey)}
                        className="text-slate-300 hover:text-red-400 transition-colors shrink-0 mt-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      {/* 수량 조절 */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setQty(item.cartKey, item.qty - 1)}
                          className="w-6 h-6 bg-slate-100 hover:bg-slate-200 rounded-md flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-2.5 h-2.5 text-slate-600" />
                        </button>
                        <span className="text-xs font-bold text-slate-800 w-6 text-center">{item.qty}</span>
                        <button
                          onClick={() => setQty(item.cartKey, item.qty + 1)}
                          className="w-6 h-6 bg-slate-100 hover:bg-slate-200 rounded-md flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-2.5 h-2.5 text-slate-600" />
                        </button>
                      </div>
                      {/* 금액 */}
                      <span className="text-xs font-bold text-slate-900">
                        {(item.unitPrice * item.qty).toLocaleString()}원
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">{item.tier} · {item.unitPrice.toLocaleString()}원/{item.qty > 1 ? `${item.qty}건` : "건"}</p>
                  </div>
                ))}
              </div>

              {/* 합계 */}
              <div className="border-t border-slate-200 px-4 py-3 space-y-1.5 shrink-0 bg-white">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>장바구니 소계</span>
                  <span>{cartSubtotal.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>이 상품</span>
                  <span className="text-blue-600 font-semibold">+{thisTotal.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between text-xs text-green-600">
                  <span>5% 즉시 할인</span>
                  <span>-{discount.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between items-center pt-1.5 border-t border-slate-100">
                  <span className="text-sm font-bold text-slate-900">전체 합계</span>
                  <span className="text-base font-bold text-blue-600">{(grandTotal - discount).toLocaleString()}원~</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="px-5 py-4 border-t border-slate-100 space-y-2.5 shrink-0 bg-white">
          <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-green-500" />실사용자 100%</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-blue-500" />24h 내 시작</span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || success}
            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-colors ${
              success
                ? "bg-green-600 text-white"
                : loading
                ? "bg-blue-400 text-white cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {success ? (
              <><CheckCircle2 className="w-4 h-4" />주문 완료! 마이페이지로...</>
            ) : loading ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />처리 중...</>
            ) : (
              <><Zap className="w-4 h-4" />{isLoggedIn ? `이 상품 ${thisTotal.toLocaleString()}원 바로 주문` : "로그인 후 주문하기"}</>
            )}
          </button>

          {items.length > 0 && (
            <button
              onClick={goToCart}
              className="w-full flex items-center justify-center gap-2 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-semibold rounded-xl transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              장바구니 전체 주문하기 ({totalCount}개)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
