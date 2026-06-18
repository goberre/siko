"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { categories, industries } from "@/lib/data";
import type { Service } from "@/lib/data";
import ServiceCard from "@/components/ServiceCard";
import { ChevronDown, Search, X } from "lucide-react";

const sortOptions = [
  { value: "popular", label: "인기순" },
  { value: "rating", label: "평점순" },
  { value: "price_asc", label: "낮은 가격순" },
  { value: "price_desc", label: "높은 가격순" },
  { value: "review", label: "리뷰 많은순" },
];

type FilterMode = "platform" | "industry";

function ServicesContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const industryParam = searchParams.get("industry");
  const queryParam = searchParams.get("q") || "";

  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [filterMode, setFilterMode] = useState<FilterMode>(industryParam ? "industry" : "platform");
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || "all");
  const [selectedIndustry, setSelectedIndustry] = useState(industryParam || "all");
  const [sortBy, setSortBy] = useState("popular");
  const [localSearch, setLocalSearch] = useState(queryParam);

  useEffect(() => {
    fetch("/api/services", { next: { revalidate: 60 } } as RequestInit)
      .then((r) => r.json())
      .then((data) => setServices(Array.isArray(data) ? data : []))
      .catch(() => setServices([]))
      .finally(() => setLoadingServices(false));
  }, []);

  const filtered = useMemo(() => {
    let result = [...services];

    if (filterMode === "platform" && selectedCategory !== "all") {
      result = result.filter((s) => s.category === selectedCategory);
    }
    if (filterMode === "industry" && selectedIndustry !== "all") {
      result = result.filter((s) => s.industry?.includes(selectedIndustry));
    }

    if (localSearch.trim()) {
      const q = localSearch.toLowerCase();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    switch (sortBy) {
      case "rating": result.sort((a, b) => b.rating - a.rating); break;
      case "price_asc": result.sort((a, b) => a.price - b.price); break;
      case "price_desc": result.sort((a, b) => b.price - a.price); break;
      case "review": result.sort((a, b) => b.reviewCount - a.reviewCount); break;
      default: result.sort((a, b) => b.reviewCount - a.reviewCount);
    }
    return result;
  }, [services, filterMode, selectedCategory, selectedIndustry, sortBy, localSearch]);

  const activeCategory = categories.find((c) => c.id === selectedCategory);
  const activeIndustry = industries.find((i) => i.id === selectedIndustry);
  const pageTitle = filterMode === "industry"
    ? (activeIndustry ? `${activeIndustry.name} 마케팅` : "업종별 전체")
    : (activeCategory ? activeCategory.name : "전체 서비스");

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">{pageTitle}</h1>
          <p className="text-sm text-slate-500">{filtered.length}개의 마케팅 서비스를 찾았습니다</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="w-full lg:w-60 shrink-0">
            <div className="bg-white rounded-2xl border border-slate-100 p-4 sticky top-24 space-y-4">
              {/* Mode Toggle */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setFilterMode("platform")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filterMode === "platform" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                  }`}
                >
                  플랫폼별
                </button>
                <button
                  onClick={() => setFilterMode("industry")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filterMode === "industry" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                  }`}
                >
                  업종별
                </button>
              </div>

              {/* Platform Filter */}
              {filterMode === "platform" && (
                <div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
                    플랫폼 카테고리
                  </h3>
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm mb-1 transition-colors ${
                      selectedCategory === "all" ? "bg-blue-50 text-blue-600 font-semibold" : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>전체</span>
                    <span className="text-xs text-slate-400">{services.length}</span>
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm mb-1 transition-colors ${
                        selectedCategory === cat.id ? "bg-blue-50 text-blue-600 font-semibold" : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span className="text-xs text-slate-400">{cat.count}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Industry Filter */}
              {filterMode === "industry" && (
                <div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
                    업종 선택
                  </h3>
                  <button
                    onClick={() => setSelectedIndustry("all")}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm mb-1 transition-colors ${
                      selectedIndustry === "all" ? "bg-blue-50 text-blue-600 font-semibold" : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>전체 업종</span>
                    <span className="text-xs text-slate-400">{services.length}</span>
                  </button>
                  {industries.map((ind) => {
                    const cnt = services.filter((s) => s.industry?.includes(ind.id)).length;
                    return (
                      <button
                        key={ind.id}
                        onClick={() => setSelectedIndustry(ind.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm mb-1 transition-colors ${
                          selectedIndustry === ind.id ? "bg-blue-50 text-blue-600 font-semibold" : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <span>{ind.name}</span>
                        <span className="text-xs text-slate-400">{cnt}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  placeholder="서비스 검색..."
                  className="w-full pl-9 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {localSearch && (
                  <button
                    onClick={() => setLocalSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                  </button>
                )}
              </div>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Grid */}
            {loadingServices ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-sm text-slate-500">서비스 목록 불러오는 중...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                  <Search className="w-7 h-7 text-slate-400" />
                </div>
                <p className="text-slate-700 font-medium mb-1">검색 결과가 없습니다</p>
                <p className="text-sm text-slate-500">
                  다른 검색어나 카테고리를 시도해보세요
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="text-slate-400">로딩 중...</div></div>}>
      <ServicesContent />
    </Suspense>
  );
}
