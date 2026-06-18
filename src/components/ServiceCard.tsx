"use client";

import Link from "next/link";
import { Star, Zap, ShoppingCart, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { useCart } from "@/lib/cartContext";
import type { Service } from "@/lib/data";

const QuickOrderModal = dynamic(() => import("./QuickOrderModal"), { ssr: false });

const badgeColors = {
  인기: "bg-orange-50 text-orange-600 border border-orange-200",
  신규: "bg-green-50 text-green-600 border border-green-200",
  추천: "bg-blue-50 text-blue-600 border border-blue-200",
};

const categoryIcons: Record<string, string> = {
  store: "🛍️", place: "📍", app: "📱", seo: "📈",
  sns: "💬", blog: "📝", ad: "🎯", etc: "⚡",
};

const categoryNames: Record<string, string> = {
  store: "스토어", place: "플레이스 · 지도", app: "앱 · 어플",
  seo: "SEO · 검색최적화", sns: "SNS 채널", blog: "블로그 · 카페",
  ad: "검색광고 대행", etc: "기타 플랫폼",
};

export default function ServiceCard({ service }: { service: Service }) {
  const { data: session } = useSession();
  const { addItem, isInCart } = useCart();

  const [showModal, setShowModal] = useState(false);
  const [cartAdded, setCartAdded] = useState(false);

  const cartKey   = `${service.id}__스탠다드`;
  const unitPrice = Math.round(service.price * 2.5);
  const inCart    = isInCart(cartKey);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      cartKey,
      serviceId:   service.id,
      serviceName: service.title,
      category:    categoryNames[service.category] ?? service.category,
      tier:        "스탠다드",
      unitPrice,
    });
    setCartAdded(true);
    setTimeout(() => setCartAdded(false), 1800);
  };

  const handleQuickOrder = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowModal(true);
  };

  return (
    <>
      <div className="group relative flex flex-col bg-white border border-slate-100 rounded-2xl hover:border-blue-200 hover:shadow-md transition-all duration-200">
        <Link href={`/services/${service.id}`} className="flex flex-col flex-1 p-5">
          {/* Top row */}
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-lg shrink-0">
              {categoryIcons[service.category] ?? "⚡"}
            </div>
            {service.badge && (
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badgeColors[service.badge as keyof typeof badgeColors] ?? "bg-slate-100 text-slate-600"}`}>
                {service.badge}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 mb-1.5 group-hover:text-blue-600 transition-colors leading-snug">
            {service.title}
          </h3>

          {/* Description */}
          <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
            {service.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-4">
            {service.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[11px] px-2 py-0.5 bg-slate-50 text-slate-500 rounded-full border border-slate-100">
                {tag}
              </span>
            ))}
          </div>

          {/* Price + Rating */}
          <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-50">
            <div>
              <span className="text-base font-bold text-slate-900">
                {service.price.toLocaleString()}원
              </span>
              <span className="text-xs text-slate-400 ml-1">~/{service.priceUnit}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-xs font-semibold text-slate-700">{service.rating}</span>
              <span className="text-xs text-slate-400">({service.reviewCount.toLocaleString()})</span>
            </div>
          </div>
        </Link>

        {/* 액션 버튼 2개 */}
        <div className="px-4 pb-4 grid grid-cols-2 gap-2">
          {/* 바로 주문 */}
          <button
            onClick={handleQuickOrder}
            className="flex items-center justify-center gap-1.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors"
          >
            <Zap className="w-3.5 h-3.5" />
            바로 주문
          </button>

          {/* 장바구니 */}
          <button
            onClick={handleAddToCart}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl border transition-colors ${
              cartAdded || inCart
                ? "border-green-300 bg-green-50 text-green-700"
                : "border-slate-200 hover:bg-slate-50 text-slate-600"
            }`}
          >
            {cartAdded ? (
              <><CheckCircle2 className="w-3.5 h-3.5" />담겼어요!</>
            ) : inCart ? (
              <><ShoppingCart className="w-3.5 h-3.5" />담겨있음</>
            ) : (
              <><ShoppingCart className="w-3.5 h-3.5" />장바구니</>
            )}
          </button>
        </div>
      </div>

      {/* 바로 주문 모달 */}
      {showModal && (
        <QuickOrderModal
          serviceId={service.id}
          serviceName={service.title}
          category={categoryNames[service.category] ?? service.category}
          basePrice={service.price}
          priceUnit={service.priceUnit}
          isLoggedIn={!!session}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
