"use client";

import { useState } from "react";
import { Save, Globe, Bell, Shield, CreditCard } from "lucide-react";

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900">설정</h1>
        <p className="text-sm text-slate-500 mt-0.5">사이트 운영 관련 설정을 관리합니다</p>
      </div>

      {/* Site Info */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <Globe className="w-4 h-4 text-slate-500" />
          <h2 className="text-sm font-bold text-slate-900">사이트 정보</h2>
        </div>
        <div className="p-5 space-y-4">
          {[
            { label: "사이트명", defaultValue: "SIKO" },
            { label: "도메인", defaultValue: "siko.kr" },
            { label: "고객센터 번호", defaultValue: "미정" },
            { label: "고객센터 이메일", defaultValue: "contact@siko.kr" },
          ].map((f) => (
            <div key={f.label}>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">{f.label}</label>
              <input
                type="text"
                defaultValue={f.defaultValue}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Margin Settings */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <CreditCard className="w-4 h-4 text-slate-500" />
          <h2 className="text-sm font-bold text-slate-900">마진 설정</h2>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">최소 마진 (%)</label>
              <input type="number" defaultValue={15} min={0} max={100}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">최대 마진 (%)</label>
              <input type="number" defaultValue={20} min={0} max={100}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <p className="text-xs text-slate-500">실행사 원가에 설정된 마진을 적용하여 판매가를 자동 계산합니다.</p>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <Bell className="w-4 h-4 text-slate-500" />
          <h2 className="text-sm font-bold text-slate-900">알림 설정</h2>
        </div>
        <div className="p-5 space-y-3">
          {[
            { label: "새 주문 알림", defaultChecked: true },
            { label: "주문 취소 알림", defaultChecked: true },
            { label: "신규 회원 가입 알림", defaultChecked: false },
            { label: "일별 매출 리포트", defaultChecked: true },
          ].map((item) => (
            <label key={item.label} className="flex items-center justify-between py-2">
              <span className="text-sm text-slate-700">{item.label}</span>
              <input
                type="checkbox"
                defaultChecked={item.defaultChecked}
                className="w-4 h-4 accent-blue-600"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
          saved
            ? "bg-green-600 text-white"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        <Save className="w-4 h-4" />
        {saved ? "저장됨!" : "설정 저장"}
      </button>
    </div>
  );
}
