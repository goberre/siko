"use client";

import { useEffect, useState } from "react";
import { Clock, GitBranch } from "lucide-react";

const BUILD_VERSION = "v1.0.0";

// 빌드 시점 고정 (서버 컴포넌트가 아니므로 모듈 로드 시각으로 대체)
const BUILD_TIME = new Date();

function timeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60)     return `${diff}초 전`;
  if (diff < 3600)   return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

function formatDateTime(date: Date): string {
  return date.toLocaleString("ko-KR", {
    month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function AdminVersionBadge() {
  const [, tick] = useState(0);

  // 1분마다 "몇 분 전" 갱신
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500">
      {/* 버전 */}
      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-full">
        <GitBranch className="w-3 h-3 text-slate-400" />
        <span className="font-mono font-semibold text-slate-600">{BUILD_VERSION}</span>
      </div>

      {/* 마지막 업데이트 */}
      <div
        className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-full cursor-default"
        title={`서버 시작: ${formatDateTime(BUILD_TIME)}`}
      >
        <Clock className="w-3 h-3 text-slate-400" />
        <span>업데이트 {timeAgo(BUILD_TIME)}</span>
        <span className="text-slate-400">· {formatDateTime(BUILD_TIME)}</span>
      </div>
    </div>
  );
}
