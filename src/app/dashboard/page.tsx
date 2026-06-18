"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package, Clock, PlayCircle, CheckCircle2,
  XCircle, ChevronRight, Inbox, ExternalLink,
} from "lucide-react";

type Order = {
  id: string;
  serviceName: string;
  tier: string;
  amount: number;
  status: "pending" | "processing" | "completed" | "cancelled";
  requestUrl: string;
  requestKeyword?: string;
  requestMemo?: string;
  createdAt: string;
};

const STATUS_CONFIG = {
  pending:    { label: "접수 대기",  color: "text-amber-700  bg-amber-50  border-amber-200",  icon: Clock },
  processing: { label: "작업 진행중", color: "text-blue-700   bg-blue-50   border-blue-200",   icon: PlayCircle },
  completed:  { label: "작업 완료",  color: "text-green-700  bg-green-50  border-green-200",  icon: CheckCircle2 },
  cancelled:  { label: "취소됨",     color: "text-red-600    bg-red-50    border-red-200",     icon: XCircle },
};

const STEPS = ["접수 대기", "작업 진행중", "작업 완료"];

export default function DashboardPage() {
  const router = useRouter();
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => {
        if (r.status === 401) { router.push("/login?callbackUrl=/dashboard"); return null; }
        return r.json();
      })
      .then((data) => { if (data) setOrders(Array.isArray(data) ? data : []); })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [router]);

  const counts = {
    total:      orders.length,
    pending:    orders.filter((o) => o.status === "pending").length,
    processing: orders.filter((o) => o.status === "processing").length,
    completed:  orders.filter((o) => o.status === "completed").length,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-slate-900">마이페이지</h1>
          <p className="text-sm text-slate-500 mt-1">주문 현황 및 작업 진행 상태를 확인하세요</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {/* 요약 카드 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "전체 주문",  value: counts.total,      color: "text-slate-900",  bg: "bg-white" },
            { label: "접수 대기",  value: counts.pending,    color: "text-amber-600",  bg: "bg-amber-50" },
            { label: "작업 중",    value: counts.processing, color: "text-blue-600",   bg: "bg-blue-50" },
            { label: "완료",       value: counts.completed,  color: "text-green-600",  bg: "bg-green-50" },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-2xl border border-slate-100 p-4`}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* 주문 목록 */}
        <div>
          <h2 className="text-sm font-bold text-slate-900 mb-3">주문 내역</h2>

          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-100 flex flex-col items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm text-slate-400">불러오는 중...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                <Inbox className="w-7 h-7 text-slate-300" />
              </div>
              <p className="text-sm font-semibold text-slate-500">아직 주문이 없습니다</p>
              <p className="text-xs text-slate-400 mt-1.5 mb-5">원하는 서비스를 주문해보세요</p>
              <Link
                href="/services"
                className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
              >
                서비스 둘러보기
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => {
                const cfg = STATUS_CONFIG[order.status];
                const StatusIcon = cfg.icon;
                const isExpanded = expanded === order.id;
                const stepIdx = order.status === "pending" ? 0 : order.status === "processing" ? 1 : order.status === "completed" ? 2 : -1;

                return (
                  <div key={order.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                    {/* 주문 헤더 */}
                    <button
                      onClick={() => setExpanded(isExpanded ? null : order.id)}
                      className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                          <Package className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate">{order.serviceName}</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {order.tier} · {order.amount.toLocaleString()}원 · {new Date(order.createdAt).toLocaleDateString("ko-KR")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-3">
                        <span className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${cfg.color}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {cfg.label}
                        </span>
                        <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                      </div>
                    </button>

                    {/* 상세 내용 */}
                    {isExpanded && (
                      <div className="px-5 pb-5 border-t border-slate-50 pt-4 space-y-4">

                        {/* 진행 상태 스텝 */}
                        {order.status !== "cancelled" && (
                          <div className="flex items-center gap-0">
                            {STEPS.map((step, i) => (
                              <div key={step} className="flex items-center flex-1 last:flex-none">
                                <div className="flex flex-col items-center">
                                  <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                                    i <= stepIdx
                                      ? "bg-blue-600 border-blue-600 text-white"
                                      : "bg-white border-slate-200 text-slate-400"
                                  }`}>
                                    {i < stepIdx ? "✓" : i + 1}
                                  </div>
                                  <span className={`text-[10px] mt-1 whitespace-nowrap ${i <= stepIdx ? "text-blue-600 font-semibold" : "text-slate-400"}`}>
                                    {step}
                                  </span>
                                </div>
                                {i < STEPS.length - 1 && (
                                  <div className={`flex-1 h-0.5 mx-1 mb-4 ${i < stepIdx ? "bg-blue-600" : "bg-slate-200"}`} />
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* 주문 정보 */}
                        <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
                          <div className="flex gap-3">
                            <span className="text-slate-500 w-20 shrink-0">주문번호</span>
                            <span className="font-mono text-slate-700">{order.id.slice(-8).toUpperCase()}</span>
                          </div>
                          <div className="flex gap-3">
                            <span className="text-slate-500 w-20 shrink-0">작업 URL</span>
                            <a href={order.requestUrl} target="_blank" rel="noopener noreferrer"
                              className="text-blue-600 hover:underline truncate flex items-center gap-1">
                              {order.requestUrl}
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          </div>
                          {order.requestKeyword && (
                            <div className="flex gap-3">
                              <span className="text-slate-500 w-20 shrink-0">키워드</span>
                              <span className="text-slate-700">{order.requestKeyword}</span>
                            </div>
                          )}
                          {order.requestMemo && (
                            <div className="flex gap-3">
                              <span className="text-slate-500 w-20 shrink-0">요청사항</span>
                              <span className="text-slate-700">{order.requestMemo}</span>
                            </div>
                          )}
                        </div>

                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 추가 서비스 */}
        <div className="bg-blue-600 rounded-2xl p-6 flex items-center justify-between">
          <div>
            <p className="text-white font-bold">더 많은 서비스 둘러보기</p>
            <p className="text-blue-200 text-sm mt-0.5">다양한 마케팅 서비스를 확인해보세요</p>
          </div>
          <Link
            href="/services"
            className="px-4 py-2 bg-white text-blue-600 text-sm font-bold rounded-xl hover:bg-blue-50 transition-colors shrink-0"
          >
            서비스 보기
          </Link>
        </div>

      </div>
    </div>
  );
}
