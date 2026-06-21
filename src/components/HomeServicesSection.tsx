"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ServiceCard from "./ServiceCard";
import type { Service } from "@/lib/data";

function CardSkeleton() {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 bg-slate-100 rounded-xl" />
        <div className="w-10 h-5 bg-slate-100 rounded-full" />
      </div>
      <div className="h-4 bg-slate-100 rounded mb-1.5 w-3/4" />
      <div className="h-3 bg-slate-100 rounded mb-1 w-full" />
      <div className="h-3 bg-slate-100 rounded mb-4 w-5/6" />
      <div className="flex gap-1 mb-4">
        <div className="h-4 w-14 bg-slate-100 rounded-full" />
        <div className="h-4 w-14 bg-slate-100 rounded-full" />
      </div>
      <div className="border-t border-slate-50 pt-3 flex justify-between">
        <div className="h-4 w-20 bg-slate-100 rounded" />
        <div className="h-4 w-16 bg-slate-100 rounded" />
      </div>
    </div>
  );
}

export default function HomeServicesSection() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    fetch("/api/services", { cache: "force-cache" })
      .then((r) => r.json())
      .then((data: unknown) => setServices(Array.isArray(data) ? data : []))
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, []);

  const popular  = services.filter((s) => s.badge === "인기").slice(0, 8);
  const newest   = services.filter((s) => s.badge === "신규").slice(0, 4);
  const topFour  = services.slice(0, 4);
  const show     = popular.length > 0 ? popular : topFour;

  return (
    <>
      {/* 인기 서비스 */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="inline-block text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full mb-2">🔥 인기</span>
              <h2 className="text-2xl font-bold text-slate-900">가장 많이 주문한 서비스</h2>
              <p className="mt-1 text-sm text-slate-500">실사용자들이 검증한 효과적인 마케팅</p>
            </div>
            <Link href="/services" className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
              전체보기 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
              : show.map((s) => <ServiceCard key={s.id} service={s} />)
            }
          </div>
        </div>
      </section>

      {/* 신규 서비스 */}
      {(loading || newest.length > 0) && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="inline-block text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full mb-2">✨ 신규</span>
                <h2 className="text-2xl font-bold text-slate-900">새로 추가된 서비스</h2>
                <p className="mt-1 text-sm text-slate-500">최신 트렌드를 반영한 마케팅 서비스</p>
              </div>
              <Link href="/services?badge=신규" className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
                전체보기 <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
                : newest.map((s) => <ServiceCard key={s.id} service={s} />)
              }
            </div>
          </div>
        </section>
      )}
    </>
  );
}
