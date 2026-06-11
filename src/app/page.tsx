import Hero from "@/components/Hero";
import CategoryGrid from "@/components/CategoryGrid";
import ServiceCard from "@/components/ServiceCard";
import { bestServices, services } from "@/lib/data";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap, HeartHandshake, BarChart3 } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "실사용자 100% 보장",
    desc: "봇이 아닌 실제 사용자 기반의 마케팅으로 안전하고 지속적인 효과를 보장합니다.",
  },
  {
    icon: Zap,
    title: "빠른 작업 시작",
    desc: "결제 후 평균 24시간 내 작업이 시작됩니다. 진행 상황을 실시간으로 확인할 수 있습니다.",
  },
  {
    icon: HeartHandshake,
    title: "합리적인 가격",
    desc: "중간 마진 15~20%만 추가하여 최저가로 서비스를 제공합니다.",
  },
  {
    icon: BarChart3,
    title: "투명한 결과 보고",
    desc: "작업 완료 후 상세 리포트를 제공합니다. 수치로 확인하는 마케팅 효과.",
  },
];

export default function Home() {
  const newServices = services.filter((s) => s.badge === "신규").slice(0, 4);
  const recommendedServices = services.filter((s) => s.badge === "추천").slice(0, 4);

  return (
    <div>
      <Hero />

      {/* Category Grid */}
      <CategoryGrid />

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="h-px bg-slate-100" />
      </div>

      {/* Best Services */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">인기 서비스</h2>
              <p className="mt-1 text-sm text-slate-500">가장 많이 이용하는 마케팅 서비스</p>
            </div>
            <Link
              href="/services"
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              전체보기
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {bestServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-900">왜 SIKO인가요?</h2>
            <p className="mt-2 text-sm text-slate-500">합리적인 가격, 실사용자 기반, 투명한 운영</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-slate-100">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2 text-sm">{title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New Services */}
      {newServices.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">신규 서비스</h2>
                <p className="mt-1 text-sm text-slate-500">새롭게 추가된 마케팅 서비스</p>
              </div>
              <Link
                href="/services?badge=신규"
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                전체보기
                <ArrowRight className="w-4 h-4" />
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

      {/* CTA Banner */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            지금 바로 시작하세요
          </h2>
          <p className="text-blue-100 mb-8 text-base">
            무료 회원가입 후 원하는 서비스를 즉시 주문할 수 있습니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/services"
              className="px-8 py-3.5 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors text-sm"
            >
              서비스 둘러보기
            </Link>
            <Link
              href="/register"
              className="px-8 py-3.5 bg-blue-700 text-white font-semibold rounded-xl hover:bg-blue-800 transition-colors text-sm border border-blue-500"
            >
              무료 회원가입
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
