import {
  TrendingUp, ShoppingBag, Users, Clock,
  Package, ArrowRight, BarChart3, Inbox,
} from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await auth();
  if (!session || session.user.role !== "admin") redirect("/");

  const [activeServices, totalUsers, totalOrders] = await Promise.all([
    prisma.service.count({ where: { active: true } }).catch(() => 0),
    prisma.user.count({ where: { role: "user" } }).catch(() => 0),
    prisma.order.count().catch(() => 0),
  ]);

  const statCards = [
    {
      label: "이번 달 매출",
      value: "—",
      sub: "주문이 발생하면 집계됩니다",
      icon: TrendingUp,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "총 주문 수",
      value: `${totalOrders}건`,
      sub: totalOrders === 0 ? "아직 주문이 없습니다" : "전체 주문 수",
      icon: ShoppingBag,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      label: "등록 서비스",
      value: `${activeServices}개`,
      sub: "현재 노출 중인 서비스",
      icon: Package,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      label: "가입 회원",
      value: `${totalUsers}명`,
      sub: "전체 일반 회원 수",
      icon: Users,
      iconBg: "bg-teal-50",
      iconColor: "text-teal-600",
    },
    {
      label: "처리 대기",
      value: "0건",
      sub: "대기 중인 주문 없음",
      icon: Clock,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
  ];

  const quickActions = [
    {
      icon: Package,
      label: "서비스 추가하기",
      desc: "새 마케팅 서비스를 등록합니다",
      href: "/admin/services",
      accent: true,
    },
    {
      icon: ShoppingBag,
      label: "주문 관리",
      desc: "들어온 주문을 확인하고 처리합니다",
      href: "/admin/orders",
      accent: false,
    },
    {
      icon: Users,
      label: "회원 관리",
      desc: "가입 회원 목록을 확인합니다",
      href: "/admin/users",
      accent: false,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">대시보드</h1>
        <p className="text-sm text-slate-500 mt-0.5">SIKO 운영 현황</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className="mb-3">
              <div className={`w-9 h-9 ${card.iconBg} rounded-xl flex items-center justify-center`}>
                <card.icon className={`w-4 h-4 ${card.iconColor}`} />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{card.value}</div>
            <div className="text-xs font-medium text-slate-700 mt-0.5">{card.label}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Chart empty state */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-5">
          <h2 className="text-sm font-bold text-slate-900 mb-1">일별 매출</h2>
          <p className="text-xs text-slate-500 mb-6">최근 7일</p>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-3">
              <BarChart3 className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-400">아직 매출 데이터가 없습니다</p>
            <p className="text-xs text-slate-300 mt-1">첫 주문이 발생하면 차트가 표시됩니다</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <h2 className="text-sm font-bold text-slate-900 mb-1">카테고리별 매출</h2>
          <p className="text-xs text-slate-500 mb-6">이번 달 기준</p>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-3">
              <BarChart3 className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-xs text-slate-400">데이터 없음</p>
          </div>
        </div>
      </div>

      {/* Recent Orders empty state */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">최근 주문</h2>
          </div>
          <Link href="/admin/orders" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
            전체보기 →
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-3">
            <Inbox className="w-6 h-6 text-slate-300" />
          </div>
          <p className="text-sm font-medium text-slate-400">아직 주문이 없습니다</p>
          <p className="text-xs text-slate-300 mt-1">고객이 서비스를 주문하면 여기에 표시됩니다</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-bold text-slate-900 mb-3">바로가기</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className={`flex items-center justify-between p-5 rounded-2xl border transition-all group ${
                action.accent
                  ? "bg-blue-600 border-blue-600 hover:bg-blue-700"
                  : "bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  action.accent ? "bg-blue-500" : "bg-slate-50"
                }`}>
                  <action.icon className={`w-4 h-4 ${action.accent ? "text-white" : "text-slate-600"}`} />
                </div>
                <div>
                  <p className={`text-sm font-semibold ${action.accent ? "text-white" : "text-slate-900"}`}>
                    {action.label}
                  </p>
                  <p className={`text-xs mt-0.5 ${action.accent ? "text-blue-200" : "text-slate-500"}`}>
                    {action.desc}
                  </p>
                </div>
              </div>
              <ArrowRight className={`w-4 h-4 shrink-0 ${action.accent ? "text-blue-200" : "text-slate-400"}`} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
