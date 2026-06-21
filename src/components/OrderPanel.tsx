"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Zap, ShoppingCart, MessageCircle, CheckCircle2,
  ChevronDown, ChevronUp, Minus, Plus, ShieldCheck, Clock,
} from "lucide-react";
import { useCart, type CartTier } from "@/lib/cartContext";

const TIERS = [
  { name: "스타터"   as CartTier, mult: 1,   desc: "입문 · 소규모 테스트" },
  { name: "스탠다드" as CartTier, mult: 2.5, desc: "가장 인기 · 꾸준한 성장" },
  { name: "프로"     as CartTier, mult: 6,   desc: "빠른 성장 · 대규모 진행" },
];

interface Props {
  serviceId:   string;
  serviceName: string;
  category:    string;
  basePrice:   number;
  priceUnit:   string;
}

export default function OrderPanel({
  serviceId, serviceName, category, basePrice, priceUnit,
}: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const isLoggedIn = !!session;
  const { addItem, isInCart } = useCart();

  const [tierIdx,       setTierIdx]      = useState(1);
  const [qty,           setQty]          = useState(1);
  const [loading,       setLoading]      = useState(false);
  const [success,       setSuccess]      = useState(false);
  const [cartAdded,     setCartAdded]    = useState(false);
  const [error,         setError]        = useState<string | null>(null);
  const [showForm,      setShowForm]     = useState(false);
  const [requestUrl,    setRequestUrl]   = useState("");
  const [requestKeyword, setRequestKeyword] = useState("");
  const [requestMemo,   setRequestMemo]  = useState("");

  const tier      = TIERS[tierIdx];
  const unitPrice = Math.round(basePrice * tier.mult);
  const total     = unitPrice * qty;
  const cartKey   = `${serviceId}__${tier.name}`;
  const inCart    = isInCart(cartKey);

  const handleQty = (delta: number) =>
    setQty((p) => Math.max(1, Math.min(9999, p + delta)));

  // ── 장바구니 담기 ──────────────────────────────────────
  const handleAddToCart = () => {
    addItem({ cartKey, serviceId, serviceName, category, tier: tier.name, unitPrice });
    setCartAdded(true);
    setTimeout(() => setCartAdded(false), 2000);
  };

  // ── 바로 주문 ──────────────────────────────────────────
  const handleOrder = async () => {
    if (!isLoggedIn) {
      router.push(`/login?callbackUrl=/services/${serviceId}`);
      return;
    }
    if (!requestUrl.trim()) {
      setShowForm(true);
      setError("작업 대상 URL을 입력해주세요.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId, serviceName, tier: tier.name,
          amount:         total,
          requestUrl:     requestUrl.trim(),
          requestKeyword: requestKeyword.trim(),
          requestMemo:    requestMemo.trim(),
        }),
      });
      if (res.status === 401) { router.push("/login?callbackUrl=/services/" + serviceId); return; }
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error((d as { error?: string }).error ?? "주문 실패");
      }
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "주문 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden sticky top-24">

      {/* 티어 선택 */}
      <div className="p-5 space-y-2">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">플랜 선택</p>
        {TIERS.map((t, i) => (
          <button
            key={t.name}
            onClick={() => setTierIdx(i)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
              tierIdx === i ? "border-blue-400 bg-blue-50" : "border-slate-100 hover:border-slate-200"
            }`}
          >
            <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
              tierIdx === i ? "border-blue-500 bg-blue-500" : "border-slate-300"
            }`}>
              {tierIdx === i && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900">{t.name}</span>
                <span className="text-sm font-bold text-slate-900">
                  {Math.round(basePrice * t.mult).toLocaleString()}원~/{priceUnit}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{t.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* 수량 + 실시간 금액 */}
      <div className="mx-5 mb-4 bg-slate-50 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700">주문 수량</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleQty(-1)}
              className="w-7 h-7 bg-white border border-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors"
            >
              <Minus className="w-3 h-3 text-slate-600" />
            </button>
            <input
              type="number"
              min={1}
              max={9999}
              value={qty}
              onChange={(e) => setQty(Math.max(1, Math.min(9999, parseInt(e.target.value) || 1)))}
              className="w-14 text-center text-sm font-bold border border-slate-200 rounded-lg py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
            <button
              onClick={() => handleQty(1)}
              className="w-7 h-7 bg-white border border-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors"
            >
              <Plus className="w-3 h-3 text-slate-600" />
            </button>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-3 space-y-1.5">
          <div className="flex justify-between text-xs text-slate-500">
            <span>단가</span>
            <span>{unitPrice.toLocaleString()}원/{priceUnit}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>수량</span>
            <span>{qty.toLocaleString()}건</span>
          </div>
          <div className="flex justify-between items-center pt-1">
            <span className="text-sm font-bold text-slate-900">예상 금액</span>
            <span className="text-2xl font-bold text-blue-600">{total.toLocaleString()}원~</span>
          </div>
        </div>
      </div>

      {/* 요청사항 토글 */}
      <div className="px-5 mb-4">
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs text-slate-600 font-semibold transition-colors"
        >
          <span>작업 요청사항 <span className="text-red-500">(바로 주문 시 필수)</span></span>
          {showForm ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {(showForm || error) && (
          <div className="mt-2.5 space-y-2.5 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                작업 대상 URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={requestUrl}
                onChange={(e) => { setRequestUrl(e.target.value); setError(null); }}
                placeholder="https://smartstore.naver.com/..."
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${error ? "border-red-300" : "border-slate-200"}`}
              />
              <p className="text-[10px] text-slate-400 mt-1">플레이스·스마트스토어·유튜브·앱스토어 등</p>
            </div>
            <input
              type="text"
              value={requestKeyword}
              onChange={(e) => setRequestKeyword(e.target.value)}
              placeholder="목표 키워드 (선택)"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
            <textarea
              value={requestMemo}
              onChange={(e) => setRequestMemo(e.target.value)}
              placeholder="추가 요청사항 (선택)"
              rows={2}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white resize-none"
            />
          </div>
        )}
        {error && <p className="text-[11px] text-red-500 mt-1.5 px-1">{error}</p>}
      </div>

      {/* 버튼들 */}
      <div className="px-5 pb-5 space-y-2.5">
        {/* 바로 주문 */}
        <button
          onClick={handleOrder}
          disabled={loading || success}
          className={`w-full flex items-center justify-center gap-2 py-3.5 font-bold rounded-xl text-sm transition-colors ${
            success
              ? "bg-green-600 text-white"
              : loading
              ? "bg-blue-400 text-white cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {success ? (
            <><CheckCircle2 className="w-4 h-4" />주문 완료!</>
          ) : loading ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />처리 중...</>
          ) : (
            <><Zap className="w-4 h-4" />{total.toLocaleString()}원 바로 주문하기</>
          )}
        </button>

        {/* 장바구니 담기 */}
        <button
          onClick={handleAddToCart}
          disabled={cartAdded}
          className={`w-full flex items-center justify-center gap-2 py-3 font-semibold rounded-xl text-sm border transition-colors ${
            cartAdded || inCart
              ? "border-green-300 bg-green-50 text-green-700"
              : "border-slate-200 hover:bg-slate-50 text-slate-700"
          }`}
        >
          {cartAdded ? (
            <><CheckCircle2 className="w-4 h-4" />장바구니에 담겼어요!</>
          ) : inCart ? (
            <><ShoppingCart className="w-4 h-4" />이미 장바구니에 있어요</>
          ) : (
            <><ShoppingCart className="w-4 h-4" />장바구니에 담기</>
          )}
        </button>

        {/* 상담 */}
        <a
          href="http://pf.kakao.com/_siko"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-2.5 text-slate-500 text-xs hover:text-slate-700 transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          1:1 상담 문의
        </a>
      </div>

      {/* 하단 보증 */}
      <div className="border-t border-slate-50 px-5 py-3 flex items-center justify-center gap-4">
        <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3 h-3 text-green-500" />실사용자 100%
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <Clock className="w-3 h-3 text-blue-500" />24h 내 시작
        </span>
      </div>
    </div>
  );
}
