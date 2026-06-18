"use client";

import { useEffect, useRef, useState } from "react";
import { ShoppingBag } from "lucide-react";

const ACTIVITIES = [
  { name: "김*수",  service: "네이버 플레이스 상위노출",        mins: 2  },
  { name: "이*진",  service: "인스타그램 팔로워 마케팅",         mins: 4  },
  { name: "박*현",  service: "스마트스토어 구매평 리뷰",         mins: 7  },
  { name: "최*영",  service: "유튜브 구독자·조회수 마케팅",      mins: 9  },
  { name: "정*민",  service: "구글맵 리뷰 상위노출",             mins: 12 },
  { name: "강*우",  service: "쿠팡 상위노출 트래픽",             mins: 15 },
  { name: "조*연",  service: "네이버 블로그 SEO 마케팅",         mins: 18 },
  { name: "윤*서",  service: "배달앱 리뷰 활성화 마케팅",        mins: 21 },
  { name: "한*준",  service: "네이버 지도 즐겨찾기·저장",        mins: 25 },
  { name: "오*아",  service: "틱톡 팔로워·좋아요 마케팅",        mins: 28 },
  { name: "신*철",  service: "스마트스토어 상위노출 트래픽",      mins: 31 },
  { name: "홍*빈",  service: "인스타그램 릴스 조회수",            mins: 35 },
];

export default function ActivityTicker() {
  const [idx, setIdx]   = useState(0);
  const [fade, setFade] = useState(true);
  const idxRef = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      setFade(false);
      // fade out → swap → fade in (400ms transition via CSS)
      const swapId = setTimeout(() => {
        idxRef.current = (idxRef.current + 1) % ACTIVITIES.length;
        setIdx(idxRef.current);
        setFade(true);
      }, 350);
      return () => clearTimeout(swapId);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  const item = ACTIVITIES[idx];

  return (
    <div className="bg-blue-600">
      <div className="max-w-7xl mx-auto px-4">
        <div
          className="flex items-center justify-center gap-2 py-2 text-xs text-blue-100"
          style={{ opacity: fade ? 1 : 0, transition: "opacity 0.35s ease" }}
        >
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            <ShoppingBag className="w-3.5 h-3.5 text-blue-200" />
          </div>
          <span>
            <strong className="text-white">{item.name}</strong>님이{" "}
            <strong className="text-blue-200">{item.mins}분 전</strong>{" "}
            <span className="text-white">&apos;{item.service}&apos;</span>을 주문했습니다
          </span>
        </div>
      </div>
    </div>
  );
}
