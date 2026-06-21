import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Star, ChevronRight, ShieldCheck, Clock,
  TrendingUp, CheckCircle2, MessageCircle,
} from "lucide-react";
import ServiceCard from "@/components/ServiceCard";
import OrderPanel from "@/components/OrderPanel";
import ServiceFAQ from "@/components/ServiceFAQ";

export const revalidate = 3600; // 1시간마다 재검증

export async function generateStaticParams() {
  const services = await prisma.service.findMany({
    where: { active: true },
    select: { id: true },
  }).catch(() => []);
  return services.map((s) => ({ id: s.id }));
}

const categoryNames: Record<string, string> = {
  store: "스토어",
  place: "플레이스 · 지도",
  app:   "앱 · 어플",
  seo:   "SEO · 검색최적화",
  sns:   "SNS 채널",
  blog:  "블로그 · 카페",
  ad:    "검색광고 대행",
  etc:   "기타 플랫폼",
};

const PROCESS = [
  { step: "01", label: "주문 접수",   desc: "서비스 선택 후 작업 URL과 함께 주문 완료" },
  { step: "02", label: "작업 준비",   desc: "결제 확인 후 24시간 이내 작업 팀 배정" },
  { step: "03", label: "작업 진행",   desc: "실사용자 기반으로 안전하게 작업 진행" },
  { step: "04", label: "완료 · 보고", desc: "작업 완료 후 결과 리포트 제공" },
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
    select: {
      id: true, title: true, description: true, category: true,
      subcategory: true, tags: true, price: true, priceUnit: true,
      rating: true, reviewCount: true, badge: true, active: true, industry: true,
    },
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
          <Link href={`/services?category=${service.category}`} className="hover:text-slate-700 transition-colors">
            {categoryNames[service.category]}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-800 font-medium truncate max-w-xs">{service.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── 왼쪽: 서비스 정보 ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* 메인 카드 */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              {/* 뱃지 행 */}
              <div className="flex items-center gap-2 mb-4">
                {service.badge && (
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                    service.badge === "인기" ? "bg-orange-50 text-orange-600 border-orange-200"
                    : service.badge === "신규" ? "bg-green-50 text-green-600 border-green-200"
                    : "bg-blue-50 text-blue-600 border-blue-200"
                  }`}>
                    {service.badge}
                  </span>
                )}
                {service.subcategory && (
                  <span className="text-xs text-slate-500 px-2.5 py-1 bg-slate-50 rounded-full border border-slate-100">
                    {service.subcategory}
                  </span>
                )}
              </div>

              <h1 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 leading-snug">
                {service.title}
              </h1>

              {/* 평점 */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center gap-0.5">
                  {stars.map((filled, i) => (
                    <Star key={i} className={`w-4 h-4 ${filled ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}`} />
                  ))}
                </div>
                <span className="text-sm font-bold text-slate-800">{service.rating}</span>
                <span className="text-sm text-slate-500">({service.reviewCount.toLocaleString()}개 리뷰)</span>
              </div>

              <p className="text-slate-600 leading-relaxed mb-5">{service.description}</p>

              <div className="flex flex-wrap gap-2">
                {service.tags.map((tag) => (
                  <span key={tag} className="text-xs px-3 py-1 bg-slate-50 text-slate-600 rounded-full border border-slate-100">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* 진행 프로세스 */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h2 className="text-base font-bold text-slate-900 mb-5">진행 프로세스</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {PROCESS.map((p, i) => (
                  <div key={p.step} className="relative text-center">
                    {i < PROCESS.length - 1 && (
                      <div className="hidden sm:block absolute top-4 left-full w-full h-px bg-slate-100 -translate-x-3" />
                    )}
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xs font-bold mx-auto mb-2">
                      {p.step}
                    </div>
                    <p className="text-xs font-semibold text-slate-800 mb-1">{p.label}</p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 포함 사항 */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h2 className="text-base font-bold text-slate-900 mb-4">서비스 포함 사항</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  "실사용자 기반 100% 실제 계정 활용",
                  "결제 후 24시간 이내 작업 시작",
                  "작업 완료 후 상세 결과 리포트 제공",
                  "작업 기간 내 드롭 발생 시 무료 보충",
                  "안전한 작업 방식 (계정 위험 없음)",
                  "1:1 담당자 배정으로 진행 상황 공유",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-sm text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 서비스 안내 */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h2 className="text-base font-bold text-slate-900 mb-4">서비스 안내</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: Clock,        label: "작업 시작",  value: "결제 후 24시간 이내" },
                  { icon: ShieldCheck,  label: "안전성",     value: "실사용자 100% 보장" },
                  { icon: TrendingUp,   label: "효과",       value: "지속적 성장 기여" },
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

            {/* FAQ */}
            <ServiceFAQ category={service.category} />

            {/* 상담 CTA */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-white font-semibold">궁금한 점이 있으신가요?</p>
                <p className="text-slate-400 text-sm mt-0.5">1:1 상담으로 빠르게 답변드립니다</p>
              </div>
              <a
                href="http://pf.kakao.com/_siko"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-slate-900 text-sm font-bold rounded-xl transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                카카오 상담
              </a>
            </div>
          </div>

          {/* ── 오른쪽: 주문 패널 ── */}
          <div>
            <OrderPanel
              serviceId={service.id}
              serviceName={service.title}
              category={categoryNames[service.category] ?? service.category}
              basePrice={service.price}
              priceUnit={service.priceUnit}
            />
          </div>
        </div>

        {/* 연관 서비스 */}
        {relatedServices.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-slate-900 mb-6">함께 많이 주문하는 서비스</h2>
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
