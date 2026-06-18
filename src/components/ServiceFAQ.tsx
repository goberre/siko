"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const COMMON_FAQS = [
  {
    q: "주문 후 언제 작업이 시작되나요?",
    a: "결제 확인 후 평균 24시간 이내에 작업이 시작됩니다. 주문량이 많을 경우 최대 48시간이 소요될 수 있으며, 작업 시작 시 이메일로 안내해 드립니다.",
  },
  {
    q: "작업 중 계정이 위험해지지 않나요?",
    a: "100% 실사용자 기반으로 진행하므로 계정 제재 위험이 없습니다. 봇이나 가짜 계정을 절대 사용하지 않으며, 자연스러운 유입 패턴으로 작업합니다.",
  },
  {
    q: "작업 후 수치가 떨어지면 어떻게 하나요?",
    a: "작업 기간 내 드롭이 발생하면 무료로 보충해 드립니다. 작업 완료 후 일정 기간 모니터링하며 품질을 보장합니다.",
  },
  {
    q: "결과는 어떻게 확인하나요?",
    a: "마이페이지에서 주문 진행 상태를 실시간으로 확인할 수 있습니다. 작업 완료 후에는 상세 결과 리포트를 제공해 드립니다.",
  },
  {
    q: "취소 및 환불이 가능한가요?",
    a: "작업 시작 전에는 전액 환불이 가능합니다. 작업 시작 후에는 진행된 작업량에 비례하여 부분 환불이 가능합니다. 자세한 내용은 1:1 상담으로 문의해 주세요.",
  },
];

const CATEGORY_FAQS: Record<string, { q: string; a: string }[]> = {
  place: [
    {
      q: "플레이스 상위노출은 얼마나 유지되나요?",
      a: "작업 후 효과는 일반적으로 2~4주 지속됩니다. 지속적인 유지를 원하신다면 정기 구독 플랜을 이용하시는 것을 권장합니다.",
    },
  ],
  store: [
    {
      q: "구매평 리뷰 작업 시 스마트스토어 제재 위험은 없나요?",
      a: "실제 구매자가 자발적으로 작성하는 방식으로 진행하므로 플랫폼 정책에 위반되지 않습니다. 단, 과도한 단기 집중보다는 자연스러운 속도로 진행을 권장합니다.",
    },
  ],
  sns: [
    {
      q: "팔로워가 갑자기 늘어도 계정이 안전한가요?",
      a: "일 최대 유입량을 자연스럽게 분산하여 처리하므로 계정 안전에 이상이 없습니다. 급격한 증가는 원하시는 경우 속도 조절이 가능합니다.",
    },
  ],
};

interface Props {
  category: string;
}

export default function ServiceFAQ({ category }: Props) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const faqs = [
    ...(CATEGORY_FAQS[category] ?? []),
    ...COMMON_FAQS,
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6">
      <h2 className="text-base font-bold text-slate-900 mb-4">자주 묻는 질문</h2>
      <div className="space-y-2">
        {faqs.map((faq, i) => (
          <div key={i} className="border border-slate-100 rounded-xl overflow-hidden">
            <button
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-slate-50 transition-colors"
            >
              <span className="text-sm font-medium text-slate-800">{faq.q}</span>
              {openIdx === i
                ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
              }
            </button>
            {openIdx === i && (
              <div className="px-4 pb-4 bg-slate-50 border-t border-slate-100">
                <p className="text-sm text-slate-600 leading-relaxed pt-3">{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
