"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Zap, MessageCircle, CheckCircle2 } from "lucide-react";

const tierPricing = [
  { name: "스타터",   multiplier: 1,   qty: "소량", desc: "처음 시작하는 분들에게 적합" },
  { name: "스탠다드", multiplier: 2.5, qty: "중량", desc: "꾸준한 성장을 원하는 분들에게" },
  { name: "프로",     multiplier: 6,   qty: "대량", desc: "빠른 성장이 필요한 분들에게" },
];

interface Props {
  serviceId:   string;
  serviceName: string;
  basePrice:   number;
  priceUnit:   string;
  isLoggedIn:  boolean;
}

export default function OrderPanel({ serviceId, serviceName, basePrice, priceUnit, isLoggedIn }: Props) {
  const router = useRouter();
  const [selectedTier, setSelectedTier] = useState(1); // 스탠다드 기본 선택
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  const tier = tierPricing[selectedTier];
  const amount = Math.round(basePrice * tier.multiplier);

  const handleOrder = async () => {
    if (!isLoggedIn) {
      router.push(`/login?callbackUrl=/services/${serviceId}`);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          serviceName,
          tier:   tier.name,
          amount,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as {error?: string}).error ?? "주문 실패");
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        router.push("/dashboard");
      }, 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "주문 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 sticky top-24">
      <div className="mb-5">
        <div className="text-2xl font-bold text-slate-900">
          {basePrice.toLocaleString()}원
          <span className="text-base font-normal text-slate-400 ml-1">~/{priceUnit}</span>
        </div>
        <p className="text-xs text-slate-500 mt-1">VAT 포함 · 수량에 따라 가격 변동</p>
      </div>

      {/* Tier 선택 */}
      <div className="space-y-2 mb-5">
        {tierPricing.map((t, i) => (
          <button
            key={t.name}
            type="button"
            onClick={() => setSelectedTier(i)}
            className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-colors ${
              selectedTier === i
                ? "border-blue-300 bg-blue-50"
                : "border-slate-100 hover:border-slate-200 bg-white"
            }`}
          >
            <div className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${
              selectedTier === i ? "border-blue-500 bg-blue-500" : "border-slate-300"
            }`}>
              {selectedTier === i && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900">{t.name}</span>
                <span className="text-sm font-bold text-slate-900">
                  {(basePrice * t.multiplier).toLocaleString()}원~
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{t.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* 오류 메시지 */}
      {error && (
        <p className="text-xs text-red-500 mb-3 px-1">{error}</p>
      )}

      {/* 주문 버튼 */}
      <button
        onClick={handleOrder}
        disabled={loading || success}
        className={`w-full flex items-center justify-center gap-2 py-3.5 font-semibold rounded-xl transition-colors mb-3 ${
          success
            ? "bg-green-600 text-white"
            : loading
            ? "bg-blue-400 text-white cursor-not-allowed"
            : "bg-slate-900 hover:bg-slate-800 text-white"
        }`}
      >
        {success ? (
          <>
            <CheckCircle2 className="w-4 h-4" />
            주문 완료!
          </>
        ) : loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            처리 중...
          </>
        ) : (
          <>
            <Zap className="w-4 h-4" />
            {isLoggedIn ? "바로 주문하기" : "로그인 후 주문하기"}
          </>
        )}
      </button>

      <a
        href="https://open.kakao.com/o/siko"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full flex items-center justify-center gap-2 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm rounded-xl transition-colors"
      >
        <MessageCircle className="w-4 h-4" />
        상담 문의하기
      </a>

      <p className="text-center text-xs text-slate-400 mt-4">
        결제 후 24시간 이내 작업 시작 보장
      </p>
    </div>
  );
}
