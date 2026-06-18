"use client";

import { useEffect, useRef, useState } from "react";
import { ShieldCheck, Zap, Users, Package } from "lucide-react";

const STATS = [
  { icon: Package,    label: "누적 주문",    target: 12847,  suffix: "건+",  color: "text-blue-600"  },
  { icon: Users,      label: "이용 고객",    target: 28000,  suffix: "명+",  color: "text-indigo-600" },
  { icon: ShieldCheck,label: "100% 실사용자", target: 100,    suffix: "%",    color: "text-green-600" },
  { icon: Zap,        label: "작업 시작",    target: 24,     suffix: "h 내", color: "text-orange-500" },
];

function Counter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const duration = 1600;
        const steps    = 60;
        const interval = duration / steps;
        let step = 0;
        const timer = setInterval(() => {
          step++;
          const progress = step / steps;
          // ease-out
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.round(eased * target));
          if (step >= steps) clearInterval(timer);
        }, interval);
      }
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

export default function TrustBar() {
  return (
    <div className="bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100">
          {STATS.map(({ icon: Icon, label, target, suffix, color }) => (
            <div key={label} className="flex items-center justify-center gap-3 py-4 px-6">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50 shrink-0`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div>
                <p className={`text-lg font-bold ${color} leading-none`}>
                  <Counter target={target} suffix={suffix} />
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
