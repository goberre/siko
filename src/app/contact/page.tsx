"use client";

import { useState } from "react";
import { MessageCircle, Mail, Clock, CheckCircle2, Send } from "lucide-react";

const categories = [
  "서비스 주문 문의",
  "결제 / 환불 문의",
  "작업 진행 문의",
  "대량 주문 / 견적 요청",
  "기타 문의",
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    category: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-4 py-10 text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">1:1 문의</h1>
          <p className="text-sm text-slate-500">
            평균 응답 시간 2시간 이내 · 평일 09:00 ~ 18:00
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: MessageCircle, title: "카카오톡 채널", desc: "즉시 상담 가능", accent: true },
            { icon: Mail, title: "이메일 문의", desc: "contact@siko.kr", accent: false },
            { icon: Clock, title: "응답 시간", desc: "평균 2시간 이내", accent: false },
          ].map(({ icon: Icon, title, desc, accent }) => (
            <div
              key={title}
              className={`flex items-center gap-3 p-4 rounded-2xl border ${
                accent
                  ? "bg-yellow-50 border-yellow-200"
                  : "bg-white border-slate-100"
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                accent ? "bg-yellow-400" : "bg-slate-100"
              }`}>
                <Icon className={`w-4 h-4 ${accent ? "text-white" : "text-slate-600"}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{title}</p>
                <p className="text-xs text-slate-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {submitted ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7 text-green-500" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">문의가 접수되었습니다</h2>
            <p className="text-sm text-slate-500 mb-6">
              평균 2시간 이내에 이메일 또는 연락처로 답변 드리겠습니다.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              새 문의 작성
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="홍길동"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    연락처
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="010-0000-0000"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  이메일 <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="example@email.com"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  문의 유형
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">선택해주세요</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  문의 내용 <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="문의하실 내용을 자세하게 작성해주세요."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
              >
                <Send className="w-4 h-4" />
                문의 보내기
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
