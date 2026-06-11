"use client";

import Link from "next/link";
import { ShoppingCart, ArrowLeft, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Zap } from "lucide-react";

// Demo cart items
const demoItems = [
  {
    id: "s001",
    title: "네이버 스마트스토어 상위노출",
    tier: "스탠다드",
    price: 25000,
    qty: 1,
    category: "스토어",
  },
  {
    id: "p001",
    title: "네이버 플레이스 상위노출",
    tier: "스타터",
    price: 11000,
    qty: 2,
    category: "플레이스",
  },
];

export default function CartPage() {
  const subtotal = demoItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discount = Math.round(subtotal * 0.05);
  const total = subtotal - discount;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 py-6 flex items-center gap-3">
          <Link
            href="/services"
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            쇼핑 계속하기
          </Link>
          <span className="text-slate-300">/</span>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            장바구니 ({demoItems.length}개)
          </h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {demoItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <ShoppingCart className="w-7 h-7 text-slate-400" />
            </div>
            <p className="text-slate-700 font-medium mb-2">장바구니가 비어있습니다</p>
            <Link
              href="/services"
              className="text-sm text-blue-600 hover:underline"
            >
              서비스 둘러보기 →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-3">
              {demoItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-100 p-5 flex items-start gap-4"
                >
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 text-lg">
                    📦
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-400 mb-0.5">{item.category}</p>
                    <p className="text-sm font-semibold text-slate-900 truncate">{item.title}</p>
                    <span className="inline-block text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full mt-1">
                      {item.tier} 플랜
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <button className="text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-2">
                      <button className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center transition-colors">
                        <Minus className="w-3 h-3 text-slate-600" />
                      </button>
                      <span className="w-6 text-center text-sm font-medium text-slate-900">
                        {item.qty}
                      </span>
                      <button className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center transition-colors">
                        <Plus className="w-3 h-3 text-slate-600" />
                      </button>
                    </div>
                    <span className="text-base font-bold text-slate-900">
                      {(item.price * item.qty).toLocaleString()}원
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-white rounded-2xl border border-slate-100 p-5 sticky top-24">
                <h2 className="font-bold text-slate-900 mb-5">주문 요약</h2>

                <div className="space-y-3 mb-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">상품 합계</span>
                    <span className="text-slate-900">{subtotal.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">즉시 할인 (5%)</span>
                    <span className="text-green-600">-{discount.toLocaleString()}원</span>
                  </div>
                  <div className="h-px bg-slate-100 my-2" />
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-900">최종 결제금액</span>
                    <span className="text-blue-600 text-lg">{total.toLocaleString()}원</span>
                  </div>
                </div>

                <button className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors mb-3">
                  결제하기
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="space-y-2 pt-3 border-t border-slate-100">
                  {[
                    { icon: ShieldCheck, text: "안전한 결제 시스템" },
                    { icon: Zap, text: "결제 후 24시간 내 시작" },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-2 text-xs text-slate-500">
                      <Icon className="w-3.5 h-3.5 text-green-500" />
                      {text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
