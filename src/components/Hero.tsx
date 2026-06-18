"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, TrendingUp, Users, Star } from "lucide-react";

const suggestions = [
  "인스타그램 팔로워",
  "네이버 플레이스 리뷰",
  "구글맵 평점",
  "유튜브 구독자",
  "스마트스토어 구매평",
];

const stats = [
  { icon: TrendingUp, label: "누적 서비스", value: "144개+" },
  { icon: Users,      label: "누적 주문",   value: "12,847건+" },
  { icon: Star,       label: "평균 평점",   value: "4.9 / 5.0" },
];

export default function Hero() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/services?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <section className="relative bg-gradient-to-b from-slate-900 to-slate-800 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Accent glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600 opacity-10 rounded-full blur-3xl" />

      <div className="relative max-w-4xl mx-auto px-4 py-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-600/20 border border-blue-500/30 rounded-full text-blue-400 text-xs font-medium mb-6">
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
          실사용자 기반 · 15~20% 합리적 마진
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight tracking-tight">
          더 스마트한 마케팅,<br />
          <span className="text-blue-400">합리적인 가격</span>으로
        </h1>
        <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
          스토어, 플레이스, SNS, 앱스토어까지 — 원하는 플랫폼의 마케팅 서비스를 한 곳에서 관리하세요.
        </p>

        {/* Search */}
        <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto mb-5">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="어떤 마케팅 서비스를 찾고 계신가요?"
            className="w-full pl-14 pr-36 py-4 bg-white text-slate-900 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            검색
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick suggestions */}
        <div className="flex flex-wrap justify-center gap-2 mb-14">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => router.push(`/services?q=${encodeURIComponent(s)}`)}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-slate-300 text-xs rounded-full border border-white/10 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 max-w-md mx-auto">
          {stats.map(({ icon: Icon, label, value }) => (
            <div key={label} className="text-center">
              <div className="flex justify-center mb-1">
                <Icon className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-xl font-bold text-white">{value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
