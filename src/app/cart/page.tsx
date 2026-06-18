"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/cartContext";
import {
  ShoppingCart, ArrowLeft, Trash2, Plus, Minus,
  ArrowRight, ShieldCheck, Zap, Inbox, AlertCircle,
  ChevronDown, ChevronUp, CheckCircle2,
} from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const { items, subtotal, totalCount, removeItem, setQty, clearCart } = useCart();

  // 주문 흐름 상태
  const [orderingIdx, setOrderingIdx]   = useState<number | null>(null);
  const [expandedIdx, setExpandedIdx]   = useState<number | null>(null);
  const [requestUrls, setRequestUrls]   = useState<Record<number, string>>({});
  const [requestKwds, setRequestKwds]   = useState<Record<number, string>>({});
  const [requestMemos, setRequestMemos] = useState<Record<number, string>>({});
  const [fieldErrors, setFieldErrors]   = useState<Record<number, string>>({});

  const [checkingOut, setCheckingOut] = useState(false);
  const [apiError,    setApiError]    = useState<string | null>(null);
  const [successIds,  setSuccessIds]  = useState<Set<string>>(new Set());

  const discount = Math.round(subtotal * 0.05);
  const total    = subtotal - discount;

  // ── 개별 주문 ──────────────────────────────────────────────
  const orderSingle = async (idx: number) => {
    const item = items[idx];
    const url  = (requestUrls[idx] ?? "").trim();
    if (!url) {
      setExpandedIdx(idx);
      setFieldErrors((p) => ({ ...p, [idx]: "작업 대상 URL을 입력해주세요." }));
      return;
    }

    setOrderingIdx(idx);
    setApiError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId:      item.serviceId,
          serviceName:    item.serviceName,
          tier:           item.tier,
          amount:         item.unitPrice * item.qty,

          requestUrl:     url,
          requestKeyword: (requestKwds[idx]  ?? "").trim(),
          requestMemo:    (requestMemos[idx] ?? "").trim(),
        }),
      });

      if (res.status === 401) {
        router.push("/login?callbackUrl=/cart");
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "주문 실패");
      }

      setSuccessIds((p) => new Set([...p, item.cartKey]));
      removeItem(item.cartKey);
    } catch (e) {
      setApiError(e instanceof Error ? e.message : "주문 오류 발생");
    } finally {
      setOrderingIdx(null);
    }
  };

  // ── 전체 주문 ──────────────────────────────────────────────
  const orderAll = async () => {
    // 모든 항목 URL 검증
    const missing = items.reduce<number[]>((acc, _, i) => {
      if (!(requestUrls[i] ?? "").trim()) acc.push(i);
      return acc;
    }, []);

    if (missing.length > 0) {
      const newErrors: Record<number, string> = {};
      missing.forEach((i) => { newErrors[i] = "작업 대상 URL을 입력해주세요."; });
      setFieldErrors(newErrors);
      setExpandedIdx(missing[0]);
      setApiError(`${missing.length}개 항목의 작업 URL이 필요합니다.`);
      return;
    }

    setCheckingOut(true);
    setApiError(null);
    const snapshot = [...items];

    for (let i = 0; i < snapshot.length; i++) {
      const item = snapshot[i];
      try {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            serviceId:      item.serviceId,
            serviceName:    item.serviceName,
            tier:           item.tier,
            amount:         item.unitPrice * item.qty,
            requestUrl:     (requestUrls[i] ?? "").trim(),
            requestKeyword: (requestKwds[i]  ?? "").trim(),
            requestMemo:    (requestMemos[i] ?? "").trim(),
          }),
        });
        if (res.status === 401) { router.push("/login?callbackUrl=/cart"); return; }
        if (!res.ok) throw new Error();
        setSuccessIds((p) => new Set([...p, item.cartKey]));
      } catch {
        setApiError(`"${item.serviceName}" 주문 중 오류가 발생했습니다.`);
        setCheckingOut(false);
        return;
      }
    }

    clearCart();
    setCheckingOut(false);
    router.push("/dashboard");
  };

  // ── 빈 장바구니 ────────────────────────────────────────────
  if (items.length === 0 && successIds.size === 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-white border-b border-slate-100">
          <div className="max-w-5xl mx-auto px-4 py-6 flex items-center gap-3">
            <Link href="/services" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
              <ArrowLeft className="w-4 h-4" />쇼핑 계속하기
            </Link>
            <span className="text-slate-300">/</span>
            <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />장바구니
            </h1>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-5">
            <Inbox className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-700 font-semibold mb-1.5">장바구니가 비어있습니다</p>
          <p className="text-sm text-slate-400 mb-6">원하는 서비스를 장바구니에 담아보세요</p>
          <Link href="/services" className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
            서비스 둘러보기
          </Link>
        </div>
      </div>
    );
  }

  // ── 주문 완료 후 장바구니 비워진 경우 ──────────────────────
  if (items.length === 0 && successIds.size > 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center py-20">
        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-5">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <p className="text-xl font-bold text-slate-900 mb-2">주문이 완료되었습니다!</p>
        <p className="text-sm text-slate-500 mb-6">마이페이지에서 진행 상태를 확인하세요</p>
        <Link href="/dashboard" className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
          마이페이지 가기
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 py-6 flex items-center gap-3">
          <Link href="/services" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
            <ArrowLeft className="w-4 h-4" />쇼핑 계속하기
          </Link>
          <span className="text-slate-300">/</span>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            장바구니 ({totalCount}개)
          </h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* 오류 메시지 */}
        {apiError && (
          <div className="mb-4 flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <div className="flex-1">{apiError}</div>
            <button onClick={() => setApiError(null)} className="text-red-400 hover:text-red-600">✕</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── 왼쪽: 상품 목록 ── */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item, idx) => {
              const isExp   = expandedIdx === idx;
              const isOrdering = orderingIdx === idx;
              const isDone  = successIds.has(item.cartKey);

              return (
                <div key={item.cartKey} className={`bg-white rounded-2xl border overflow-hidden transition-colors ${isDone ? "border-green-200 opacity-60" : "border-slate-100"}`}>
                  {/* 상품 행 */}
                  <div className="flex items-start gap-4 p-5">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 text-lg">
                      📦
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-400 mb-0.5">{item.category}</p>
                      <p className="text-sm font-semibold text-slate-900 truncate">{item.serviceName}</p>
                      <span className="inline-block text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full mt-1">
                        {item.tier} 플랜
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-3 shrink-0">
                      <button
                        onClick={() => removeItem(item.cartKey)}
                        className="text-slate-300 hover:text-red-500 transition-colors"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {/* 수량 조절 */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setQty(item.cartKey, item.qty - 1)}
                          className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-3 h-3 text-slate-600" />
                        </button>
                        <span className="w-6 text-center text-sm font-medium text-slate-900">{item.qty}</span>
                        <button
                          onClick={() => setQty(item.cartKey, item.qty + 1)}
                          className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-3 h-3 text-slate-600" />
                        </button>
                      </div>
                      <span className="text-base font-bold text-slate-900">
                        {(item.unitPrice * item.qty).toLocaleString()}원
                      </span>
                    </div>
                  </div>

                  {/* 요청사항 + 개별 주문 */}
                  <div className="border-t border-slate-50 px-5 pb-4">
                    <button
                      onClick={() => setExpandedIdx(isExp ? null : idx)}
                      className="w-full flex items-center justify-between py-3 text-xs text-slate-500 hover:text-slate-700 transition-colors"
                    >
                      <span className={fieldErrors[idx] ? "text-red-500 font-semibold" : ""}>
                        작업 요청사항 입력 <span className="text-red-400">*필수</span>
                        {requestUrls[idx] && <span className="ml-1.5 text-green-600">✓ 입력됨</span>}
                      </span>
                      {isExp ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isExp && (
                      <div className="space-y-2.5 pb-3">
                        <div>
                          <input
                            type="url"
                            value={requestUrls[idx] ?? ""}
                            onChange={(e) => {
                              setRequestUrls((p) => ({ ...p, [idx]: e.target.value }));
                              setFieldErrors((p) => { const n = { ...p }; delete n[idx]; return n; });
                            }}
                            placeholder="작업 대상 URL (필수)"
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${fieldErrors[idx] ? "border-red-300" : "border-slate-200"}`}
                          />
                          {fieldErrors[idx] && <p className="text-[11px] text-red-500 mt-1">{fieldErrors[idx]}</p>}
                        </div>
                        <input
                          type="text"
                          value={requestKwds[idx] ?? ""}
                          onChange={(e) => setRequestKwds((p) => ({ ...p, [idx]: e.target.value }))}
                          placeholder="목표 키워드 (선택)"
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                        <textarea
                          value={requestMemos[idx] ?? ""}
                          onChange={(e) => setRequestMemos((p) => ({ ...p, [idx]: e.target.value }))}
                          placeholder="추가 요청사항 (선택)"
                          rows={2}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white resize-none"
                        />
                      </div>
                    )}

                    {/* 이 항목만 주문 */}
                    <button
                      onClick={() => orderSingle(idx)}
                      disabled={isOrdering || isDone}
                      className={`w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
                        isDone
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : isOrdering
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                          : "bg-slate-900 hover:bg-slate-700 text-white"
                      }`}
                    >
                      {isDone ? (
                        <><CheckCircle2 className="w-3.5 h-3.5" />주문 완료</>
                      ) : isOrdering ? (
                        <><div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />처리 중...</>
                      ) : (
                        <><Zap className="w-3.5 h-3.5" />이 상품만 바로 주문</>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── 오른쪽: 주문 요약 ── */}
          <div>
            <div className="bg-white rounded-2xl border border-slate-100 p-5 sticky top-24 space-y-4">
              <h2 className="font-bold text-slate-900">주문 요약</h2>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">상품 합계 ({totalCount}개)</span>
                  <span className="text-slate-900">{subtotal.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">즉시 할인 (5%)</span>
                  <span className="text-green-600">-{discount.toLocaleString()}원</span>
                </div>
                <div className="h-px bg-slate-100" />
                <div className="flex justify-between font-bold">
                  <span className="text-slate-900">최종 결제금액</span>
                  <span className="text-blue-600 text-lg">{total.toLocaleString()}원~</span>
                </div>
              </div>

              {/* 전체 주문 */}
              <button
                onClick={orderAll}
                disabled={checkingOut || items.length === 0}
                className={`w-full flex items-center justify-center gap-2 py-3.5 font-semibold rounded-xl transition-colors ${
                  checkingOut || items.length === 0
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {checkingOut ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />처리 중...</>
                ) : (
                  <>전체 주문하기 <ArrowRight className="w-4 h-4" /></>
                )}
              </button>

              <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                전체 주문 시 아래 각 항목의 작업 URL을 모두 입력해야 합니다.
              </p>

              {/* 보안 뱃지 */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                {[
                  { icon: ShieldCheck, text: "안전한 결제 시스템" },
                  { icon: Zap,         text: "결제 후 24시간 내 작업 시작" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-xs text-slate-500">
                    <Icon className="w-3.5 h-3.5 text-green-500" />
                    {text}
                  </div>
                ))}
              </div>

              {/* 전체 비우기 */}
              <button
                onClick={() => { if (confirm("장바구니를 비울까요?")) clearCart(); }}
                className="w-full text-xs text-slate-400 hover:text-red-500 transition-colors py-1"
              >
                장바구니 전체 비우기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
