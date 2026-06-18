import Hero from "@/components/Hero";
import CategoryGrid from "@/components/CategoryGrid";
import TrustBar from "@/components/TrustBar";
import ActivityTicker from "@/components/ActivityTicker";
import ServiceCard from "@/components/ServiceCard";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  ArrowRight, ShieldCheck, Zap,
  HeartHandshake, BarChart3, CheckCircle2,
} from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "실사용자 100% 보장",
    desc: "봇이 아닌 실제 사용자 기반 마케팅으로 안전하고 지속적인 효과를 보장합니다.",
    badge: "안전",
    badgeColor: "bg-green-50 text-green-600",
  },
  {
    icon: Zap,
    title: "결제 후 24시간 내 시작",
    desc: "결제 완료 후 평균 24시간 이내 작업이 시작됩니다. 진행 상황을 실시간으로 확인하세요.",
    badge: "빠름",
    badgeColor: "bg-blue-50 text-blue-600",
  },
  {
    icon: HeartHandshake,
    title: "합리적인 15~20% 마진",
    desc: "중간 마진을 최소화해 최저가로 제공합니다. 동일 서비스 대비 가장 합리적인 가격.",
    badge: "저렴",
    badgeColor: "bg-orange-50 text-orange-600",
  },
  {
    icon: BarChart3,
    title: "투명한 결과 리포트",
    desc: "작업 완료 후 상세 리포트를 제공합니다. 수치로 직접 확인하는 마케팅 효과.",
    badge: "투명",
    badgeColor: "bg-purple-50 text-purple-600",
  },
];

const howItWorks = [
  { step: "01", title: "서비스 선택",   desc: "원하는 플랫폼과 마케팅 서비스를 선택하세요." },
  { step: "02", title: "수량 · 플랜 결정", desc: "예산에 맞게 수량과 플랜을 선택하면 금액이 자동 계산됩니다." },
  { step: "03", title: "작업 URL 입력", desc: "작업할 스토어 · 플레이스 · SNS URL을 입력합니다." },
  { step: "04", title: "작업 시작",     desc: "결제 확인 후 24시간 이내에 실사용자 작업이 시작됩니다." },
];

export default async function Home() {
  const allServices = await prisma.service.findMany({
    where: { active: true },
    orderBy: { reviewCount: "desc" },
  }).catch(() => []);

  const popularServices  = allServices.filter((s) => s.badge === "인기").slice(0, 8);
  const newServices      = allServices.filter((s) => s.badge === "신규").slice(0, 4);
  const topServices      = allServices.slice(0, 4); // 리뷰 많은 순

  return (
    <div>
      {/* 실시간 주문 피드 (맨 위) */}
      <ActivityTicker />

      {/* 히어로 */}
      <Hero />

      {/* 신뢰 지표 카운터 */}
      <TrustBar />

      {/* 카테고리 그리드 */}
      <CategoryGrid />

      <div className="max-w-7xl mx-auto px-4">
        <div className="h-px bg-slate-100" />
      </div>

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
            {(popularServices.length > 0 ? popularServices : topServices).map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      {/* 이용 방법 */}
      <section className="py-16 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-semibold text-blue-400 bg-blue-900/40 border border-blue-700/40 px-3 py-1 rounded-full mb-3">간단한 4단계</span>
            <h2 className="text-2xl font-bold text-white">어떻게 진행되나요?</h2>
            <p className="mt-2 text-sm text-slate-400">복잡한 절차 없이 빠르게 시작할 수 있어요</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((step, i) => (
              <div key={step.step} className="relative">
                {i < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-5 left-full w-full h-px bg-blue-900/60 -translate-x-3 z-0" />
                )}
                <div className="relative bg-slate-800 rounded-2xl p-6 border border-slate-700">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm mb-4">
                    {step.step}
                  </div>
                  <h3 className="font-semibold text-white mb-1.5">{step.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why SIKO */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <span className="inline-block text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full mb-3">SIKO만의 차별점</span>
            <h2 className="text-2xl font-bold text-slate-900">왜 SIKO를 선택할까요?</h2>
            <p className="mt-2 text-sm text-slate-500">합리적인 가격, 실사용자 기반, 투명한 운영</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map(({ icon: Icon, title, desc, badge, badgeColor }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-blue-200 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>{badge}</span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-2 text-sm">{title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 신규 서비스 */}
      {newServices.length > 0 && (
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
              {newServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 보증 배너 */}
      <section className="py-10 bg-white border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { emoji: "🛡️", title: "어뷰징 0%",       sub: "100% 실사용자 보장" },
              { emoji: "⚡", title: "24h 내 시작",      sub: "결제 후 즉시 처리" },
              { emoji: "📊", title: "결과 리포트 제공", sub: "작업 완료 후 수치 확인" },
              { emoji: "🔄", title: "드롭 무료 보충",   sub: "작업 기간 내 보증" },
            ].map((g) => (
              <div key={g.title} className="flex items-center gap-3">
                <div className="text-2xl">{g.emoji}</div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{g.title}</p>
                  <p className="text-xs text-slate-500">{g.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            지금 바로 시작하세요
          </h2>
          <p className="text-blue-100 mb-4 text-base">
            무료 회원가입 후 원하는 서비스를 즉시 주문할 수 있습니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            <Link href="/services" className="px-8 py-3.5 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors text-sm">
              서비스 둘러보기
            </Link>
            <Link href="/register" className="px-8 py-3.5 bg-blue-800 text-white font-semibold rounded-xl hover:bg-blue-900 transition-colors text-sm border border-blue-500">
              무료 회원가입
            </Link>
          </div>
          {/* 신뢰 포인트 */}
          <div className="flex flex-wrap justify-center gap-4 text-xs text-blue-200">
            {["신용카드 불필요", "즉시 주문 가능", "24시간 고객 지원", "드롭 무료 보충"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-300" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
