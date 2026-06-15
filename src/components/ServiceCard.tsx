import Link from "next/link";
import { Star, TrendingUp } from "lucide-react";
import { Service } from "@/lib/data";

const badgeColors = {
  인기: "bg-orange-50 text-orange-600 border border-orange-200",
  신규: "bg-green-50 text-green-600 border border-green-200",
  추천: "bg-blue-50 text-blue-600 border border-blue-200",
};

const categoryIcons: Record<string, string> = {
  store: "🛍️",
  place: "📍",
  app: "📱",
  seo: "📈",
  sns: "💬",
  blog: "📝",
  ad: "🎯",
  etc: "⚡",
};

export default function ServiceCard({ service }: { service: Service }) {
  return (
    <Link
      href={`/services/${service.id}`}
      className="group flex flex-col bg-white border border-slate-100 rounded-2xl p-5 hover:border-blue-200 hover:shadow-md transition-all duration-200"
    >
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

      {/* Bottom row */}
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
  );
}
