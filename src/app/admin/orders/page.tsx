"use client";

import { Inbox, Clock, PlayCircle, CheckCircle2, XCircle } from "lucide-react";

const statusTabs = [
  { key: "all",        label: "전체",   count: 0 },
  { key: "pending",    label: "대기중", count: 0 },
  { key: "processing", label: "진행중", count: 0 },
  { key: "completed",  label: "완료",   count: 0 },
  { key: "cancelled",  label: "취소",   count: 0 },
];

export default function AdminOrdersPage() {
  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">주문 관리</h1>
        <p className="text-sm text-slate-500 mt-0.5">고객 주문 현황</p>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Clock,        label: "대기중", cls: "text-amber-600 bg-amber-50" },
          { icon: PlayCircle,   label: "진행중", cls: "text-blue-600 bg-blue-50" },
          { icon: CheckCircle2, label: "완료",   cls: "text-green-600 bg-green-50" },
          { icon: XCircle,      label: "취소",   cls: "text-red-500 bg-red-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${s.cls}`}>
              <s.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-slate-500">{s.label}</p>
              <p className="text-lg font-bold text-slate-900">0</p>
            </div>
          </div>
        ))}
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {statusTabs.map((t, i) => (
          <button
            key={t.key}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              i === 0
                ? "bg-slate-900 text-white"
                : "bg-white border border-slate-200 text-slate-500"
            }`}
          >
            {t.label}
            <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold ${
              i === 0 ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
            }`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Empty state */}
      <div className="bg-white rounded-2xl border border-slate-100 flex flex-col items-center justify-center py-24 text-center">
        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
          <Inbox className="w-7 h-7 text-slate-300" />
        </div>
        <p className="text-sm font-semibold text-slate-500">아직 주문이 없습니다</p>
        <p className="text-xs text-slate-400 mt-1.5 max-w-xs">
          고객이 서비스를 주문하면 여기에 자동으로 표시되며,<br />
          상태를 변경하고 처리할 수 있습니다.
        </p>
      </div>
    </div>
  );
}
