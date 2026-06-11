"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag, MapPin, Smartphone, TrendingUp, Share2,
  BookOpen, Target, Grid, UtensilsCrossed, Sparkles,
  Stethoscope, Hotel, AppWindow, Tv2, Building2,
} from "lucide-react";
import { categories, industries } from "@/lib/data";

const platformIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ShoppingBag, MapPin, Smartphone, TrendingUp, Share2, BookOpen, Target, Grid,
};

const industryIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  UtensilsCrossed, Sparkles, ShoppingBag, Stethoscope, Hotel, AppWindow, Tv2, Building2,
};

const colorMap: Record<string, { bg: string; text: string; hover: string; border: string }> = {
  blue:   { bg: "bg-blue-50",   text: "text-blue-600",   hover: "hover:bg-blue-100",   border: "border-blue-200" },
  green:  { bg: "bg-green-50",  text: "text-green-600",  hover: "hover:bg-green-100",  border: "border-green-200" },
  purple: { bg: "bg-purple-50", text: "text-purple-600", hover: "hover:bg-purple-100", border: "border-purple-200" },
  orange: { bg: "bg-orange-50", text: "text-orange-600", hover: "hover:bg-orange-100", border: "border-orange-200" },
  pink:   { bg: "bg-pink-50",   text: "text-pink-600",   hover: "hover:bg-pink-100",   border: "border-pink-200" },
  teal:   { bg: "bg-teal-50",   text: "text-teal-600",   hover: "hover:bg-teal-100",   border: "border-teal-200" },
  red:    { bg: "bg-red-50",    text: "text-red-600",    hover: "hover:bg-red-100",    border: "border-red-200" },
  gray:   { bg: "bg-slate-50",  text: "text-slate-600",  hover: "hover:bg-slate-100",  border: "border-slate-200" },
  amber:  { bg: "bg-amber-50",  text: "text-amber-600",  hover: "hover:bg-amber-100",  border: "border-amber-200" },
  cyan:   { bg: "bg-cyan-50",   text: "text-cyan-600",   hover: "hover:bg-cyan-100",   border: "border-cyan-200" },
  rose:   { bg: "bg-rose-50",   text: "text-rose-600",   hover: "hover:bg-rose-100",   border: "border-rose-200" },
  slate:  { bg: "bg-slate-100", text: "text-slate-700",  hover: "hover:bg-slate-200",  border: "border-slate-300" },
};

export default function CategoryGrid() {
  const [tab, setTab] = useState<"platform" | "industry">("platform");

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header + Tab */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">카테고리 탐색</h2>
            <p className="mt-1 text-sm text-slate-500">원하는 서비스를 빠르게 찾아보세요</p>
          </div>
          {/* Tab Switch */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setTab("platform")}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                tab === "platform"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              플랫폼별
            </button>
            <button
              onClick={() => setTab("industry")}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                tab === "industry"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              업종별
            </button>
          </div>
        </div>

        {/* Platform Grid */}
        {tab === "platform" && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {categories.map((cat) => {
              const Icon = platformIconMap[cat.icon];
              const colors = colorMap[cat.color];
              return (
                <Link
                  key={cat.id}
                  href={`/services?category=${cat.id}`}
                  className={`flex flex-col items-center gap-3 p-4 rounded-2xl border border-transparent hover:border-slate-200 ${colors.hover} transition-all duration-200`}
                >
                  <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center`}>
                    {Icon && <Icon className={`w-5 h-5 ${colors.text}`} />}
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-slate-800 leading-tight">{cat.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{cat.count}개</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Industry Grid */}
        {tab === "industry" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {industries.map((ind) => {
              const Icon = industryIconMap[ind.icon];
              const colors = colorMap[ind.color];
              return (
                <Link
                  key={ind.id}
                  href={`/services?industry=${ind.id}`}
                  className={`flex items-start gap-4 p-5 rounded-2xl border ${colors.border} bg-white ${colors.hover} transition-all duration-200 group`}
                >
                  <div className={`w-11 h-11 ${colors.bg} rounded-xl flex items-center justify-center shrink-0`}>
                    {Icon && <Icon className={`w-5 h-5 ${colors.text}`} />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 mb-0.5">{ind.name}</p>
                    <p className="text-xs text-slate-500 leading-snug mb-2">{ind.desc}</p>
                    <div className="flex flex-wrap gap-1">
                      {ind.platforms.slice(0, 3).map((p) => (
                        <span
                          key={p}
                          className={`text-[10px] px-1.5 py-0.5 ${colors.bg} ${colors.text} rounded-full font-medium`}
                        >
                          {p}
                        </span>
                      ))}
                      {ind.platforms.length > 3 && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-50 text-slate-400 rounded-full">
                          +{ind.platforms.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
