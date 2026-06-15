import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Star,
  ChevronRight,
  ShoppingCart,
  Zap,
  ShieldCheck,
  Clock,
  MessageCircle,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import ServiceCard from "@/components/ServiceCard";

export const dynamic = "force-dynamic";

const categoryNames: Record<string, string> = {
  store: "스토어",
  place: "플레이스 · 지도",
  app: "앱 · 어플",
  seo: "SEO · 검색최적화",
  sns: "SNS 채널",
  blog: "블로그 · 카페",
  ad: "검색광고 대행",
  etc: "기타 플랫폼",
};

const tierPricing = [
  { name: "스타터", multiplier: 1, qty: "소량", desc: "처음 시작하는 분들에게 적합" },
  { name: "스탠다드", multiplier: 2.5, qty: "중량", desc: "꾸준한 성장을 원하는 분들에게" },
  { name: "프로", multiplier: 6, qty: "대량", desc: "빠른 성장이 필요한 분들에게" },
];

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service || !service.active) notFound();

  const relatedServices = await prisma.service.findMany({
    where: { category: service.category, id: { not: service.id }, active: true },
    orderBy: { reviewCount: "desc" },
    take: 4,
  });

  const stars = Array.from({ length: 5 }, (_, i) => i < Math.round(service.rating));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-slate-500">
          <Link href="/" className="hover:text-slate-700 transition-colors">홈</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/services" className="hover:text-slate-700 transition-colors">서비스</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link
            href={`/services?category=${service.category}`}
            className="hover:text-slate-700 transition-colors"
          >
            {categoryNames[service.category]}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-800 font-medium truncate max-w-xs">{service.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Service Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Card */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <div className="flex items-start gap-3 mb-4">
                {service.badge && (
                  <span
                    className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${
                      service.badge === "인기"
                        ? "bg-orange-50 text-orange-600 border border-orange-200"
                        : service.badge === "신규"
                        ? "bg-green-50 text-green-600 border border-green-200"
                        : "bg-blue-50 text-blue-600 border border-blue-200"
                    }`}
                  >
                    {service.badge}
                  </span>
                )}
                <span className="text-xs text-slate-500 px-2.5 py-1 bg-slate-50 rounded-full border border-slate-100">
                  {service.subcategory}
                </span>
              </div>

              <h1 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 leading-snug">
                {service.title}
              </h1>

              <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center gap-1">
                  {stars.map((filled, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        filled ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-slate-800">{service.rating}</span>
                <span className="text-sm text-slate-500">
                  ({service.reviewCount.toLocaleString()}개 리뷰)
                </span>
              </div>

              <p className="text-slate-600 leading-relaxed mb-5">{service.description}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {service.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1 bg-slate-50 text-slate-600 rounded-full border border-slate-100"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* What's included */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h2 className="text-base font-bold text-slate-900 mb-4">서비스 포함 내용</h2>
              <div className="space-y-3">
                {[
                  "실사용자 기반 100% 실제 계정 활용",
                  "빠른 작업 시작 (결제 후 24시간 이내)",
                  "작업 완료 후 상세 결과 리포트 제공",
                  "작업 기간 내 드롭 발생 시 무료 보충",
                  "안전한 작업 방식 (계정 위험 없음)",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-sm text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Service Info */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h2 className="text-base font-bold text-slate-900 mb-4">서비스 안내</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: Clock, label: "작업 시작", value: "결제 후 24시간 이내" },
                  { icon: ShieldCheck, label: "안전성", value: "실사용자 100% 보장" },
                  { icon: TrendingUp, label: "효과", value: "지속적 성장 기여" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-slate-100">
                      <Icon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">{label}</p>
                      <p className="text-sm font-medium text-slate-800 mt-0.5">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Order Panel */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 p-5 sticky top-24">
              <div className="mb-5">
                <div className="text-2xl font-bold text-slate-900">
                  {service.price.toLocaleString()}원
                  <span className="text-base font-normal text-slate-400 ml-1">~/{service.priceUnit}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">VAT 포함 · 수량에 따라 가격 변동</p>
              </div>

              {/* Tiers */}
              <div className="space-y-2 mb-5">
                {tierPricing.map((tier, i) => (
                  <label
                    key={tier.name}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      i === 1
                        ? "border-blue-300 bg-blue-50"
                        : "border-slate-100 hover:border-slate-200 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="tier"
                      defaultChecked={i === 1}
                      className="mt-0.5 accent-blue-600"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-900">{tier.name}</span>
                        <span className="text-sm font-bold text-slate-900">
                          {(service.price * tier.multiplier).toLocaleString()}원~
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{tier.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              <button className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors mb-3">
                <ShoppingCart className="w-4 h-4" />
                장바구니 담기
              </button>
              <button className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors mb-4">
                <Zap className="w-4 h-4" />
                바로 주문하기
              </button>

              <button className="w-full flex items-center justify-center gap-2 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm rounded-xl transition-colors">
                <MessageCircle className="w-4 h-4" />
                상담 문의하기
              </button>

              <p className="text-center text-xs text-slate-400 mt-4">
                결제 후 24시간 이내 작업 시작 보장
              </p>
            </div>
          </div>
        </div>

        {/* Related Services */}
        {relatedServices.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-slate-900 mb-6">연관 서비스</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedServices.map((s) => (
                <ServiceCard key={s.id} service={s} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
