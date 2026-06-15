"use client";

import { useState, useEffect } from "react";
import { Inbox, Clock, PlayCircle, CheckCircle2, XCircle, RefreshCw } from "lucide-react";

type Order = {
  id: string;
  serviceId: string;
  serviceName: string;
  tier: string;
  amount: number;
  status: "pending" | "processing" | "completed" | "cancelled";
  createdAt: string;
  user: { id: string; name: string; email: string };
};

const STATUS_LABEL: Record<string, string> = {
  pending:    "대기중",
  processing: "진행중",
  completed:  "완료",
  cancelled:  "취소",
};

const STATUS_COLOR: Record<string, string> = {
  pending:    "bg-amber-50 text-amber-700 border-amber-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  completed:  "bg-green-50 text-green-700 border-green-200",
  cancelled:  "bg-red-50 text-red-600 border-red-200",
};

const ALL_STATUSES = ["all", "pending", "processing", "completed", "cancelled"] as const;

export default function AdminOrdersPage() {
  const [orders, setOrders]         = useState<Order[]>([]);
  const [loading, setLoading]       = useState(true);
  const [activeTab, setActiveTab]   = useState<typeof ALL_STATUSES[number]>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [apiError, setApiError]     = useState<string | null>(null);

  const fetchOrders = () => {
    setLoading(true);
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setApiError("주문 목록을 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const counts = {
    all:        orders.length,
    pending:    orders.filter((o) => o.status === "pending").length,
    processing: orders.filter((o) => o.status === "processing").length,
    completed:  orders.filter((o) => o.status === "completed").length,
    cancelled:  orders.filter((o) => o.status === "cancelled").length,
  };

  const filtered = activeTab === "all" ? orders : orders.filter((o) => o.status === activeTab);

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    setApiError(null);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      const updated: Order = await res.json();
      setOrders((prev) => prev.map((o) => o.id === id ? updated : o));
    } catch {
      setApiError("상태 변경에 실패했습니다.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">주문 관리</h1>
          <p className="text-sm text-slate-500 mt-0.5">고객 주문 현황</p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          새로고침
        </button>
      </div>

      {apiError && (
        <div className="px-4 py-2.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center justify-between">
          <span>{apiError}</span>
          <button onClick={() => setApiError(null)} className="text-red-400 hover:text-red-600 ml-3">✕</button>
        </div>
      )}

      {/* Status summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Clock,        label: "대기중", key: "pending",    cls: "text-amber-600 bg-amber-50" },
          { icon: PlayCircle,   label: "진행중", key: "processing", cls: "text-blue-600 bg-blue-50" },
          { icon: CheckCircle2, label: "완료",   key: "completed",  cls: "text-green-600 bg-green-50" },
          { icon: XCircle,      label: "취소",   key: "cancelled",  cls: "text-red-500 bg-red-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${s.cls}`}>
              <s.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-slate-500">{s.label}</p>
              <p className="text-lg font-bold text-slate-900">{counts[s.key as keyof typeof counts]}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {ALL_STATUSES.map((key) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === key
                ? "bg-slate-900 text-white"
                : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
            }`}
          >
            {key === "all" ? "전체" : STATUS_LABEL[key]}
            <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold ${
              activeTab === key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
            }`}>
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      {/* Order List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-100 flex flex-col items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm text-slate-400">주문 목록 불러오는 중...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 flex flex-col items-center justify-center py-24 text-center">
          <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
            <Inbox className="w-7 h-7 text-slate-300" />
          </div>
          <p className="text-sm font-semibold text-slate-500">주문이 없습니다</p>
          <p className="text-xs text-slate-400 mt-1.5">고객이 서비스를 주문하면 여기에 자동으로 표시됩니다</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500">주문 정보</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 hidden sm:table-cell">고객</th>
                <th className="text-right px-4 py-3.5 text-xs font-semibold text-slate-500 hidden md:table-cell">금액</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500">상태</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500">변경</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-800 line-clamp-1">{order.serviceName}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {order.tier} · {new Date(order.createdAt).toLocaleDateString("ko-KR")}
                    </p>
                  </td>
                  <td className="px-4 py-4 hidden sm:table-cell">
                    <p className="text-slate-700">{order.user?.name}</p>
                    <p className="text-xs text-slate-400">{order.user?.email}</p>
                  </td>
                  <td className="px-4 py-4 text-right hidden md:table-cell">
                    <span className="font-semibold text-slate-900">{order.amount.toLocaleString()}원</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_COLOR[order.status]}`}>
                      {STATUS_LABEL[order.status]}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <select
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      <option value="pending">대기중</option>
                      <option value="processing">진행중</option>
                      <option value="completed">완료</option>
                      <option value="cancelled">취소</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
