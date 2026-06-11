"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const faqs = [
  {
    q: "서비스 시작까지 얼마나 걸리나요?",
    a: "결제 완료 후 영업일 기준 24시간 이내에 작업이 시작됩니다. 주말 및 공휴일은 다음 영업일에 시작될 수 있습니다.",
  },
  {
    q: "실사용자 기반이라는 것이 무엇인가요?",
    a: "봇이나 가짜 계정이 아닌 실제 사람들이 직접 서비스를 수행합니다. 이로 인해 플랫폼 정책 위반 없이 안전하게 마케팅 효과를 달성할 수 있습니다.",
  },
  {
    q: "작업 중 드롭(감소)이 발생하면 어떻게 하나요?",
    a: "작업 기간 내 드롭이 발생할 경우 무료로 보충해드립니다. 서비스 특성에 따라 보충 정책이 다를 수 있으니 상세 페이지를 확인해 주세요.",
  },
  {
    q: "결제 수단은 어떤 것들이 있나요?",
    a: "신용카드, 체크카드, 계좌이체, 카카오페이, 네이버페이 등 다양한 결제 수단을 지원합니다.",
  },
  {
    q: "환불은 가능한가요?",
    a: "작업 시작 전에는 100% 환불이 가능합니다. 작업 시작 후에는 진행된 비율에 따라 부분 환불이 가능합니다. 작업 완료 후에는 환불이 어렵습니다.",
  },
  {
    q: "계정 정보를 제공해야 하나요?",
    a: "대부분의 서비스는 계정 정보 없이 URL 또는 게시물 링크만으로 진행됩니다. 일부 서비스의 경우 추가 정보가 필요할 수 있으며, 이 경우 서비스 상세 페이지에 안내되어 있습니다.",
  },
  {
    q: "GPA Korea와 어떤 차이가 있나요?",
    a: "SIKO는 실행사 대비 15~20%의 합리적인 마진만을 추가하여 운영합니다. 또한 더 직관적인 UI/UX로 서비스를 쉽게 찾고 주문할 수 있도록 개선하였습니다.",
  },
  {
    q: "대량 주문 시 할인이 되나요?",
    a: "네, 대량 주문 시 별도 할인이 적용됩니다. 1:1 문의를 통해 맞춤 견적을 받아보세요.",
  },
];

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-4 py-10 text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">자주 묻는 질문</h1>
          <p className="text-sm text-slate-500">서비스 이용에 관한 궁금증을 해결해드립니다</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
              >
                <span className="text-sm font-semibold text-slate-900 pr-4">{faq.q}</span>
                {open === i ? (
                  <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>
              {open === i && (
                <div className="px-5 pb-5">
                  <p className="text-sm text-slate-600 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 p-6 bg-blue-50 rounded-2xl border border-blue-100 text-center">
          <p className="text-sm font-semibold text-slate-900 mb-1">
            찾는 답변이 없으신가요?
          </p>
          <p className="text-xs text-slate-500 mb-4">
            1:1 문의를 통해 빠르게 답변 드리겠습니다
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            1:1 문의하기
          </a>
        </div>
      </div>
    </div>
  );
}
