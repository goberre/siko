"use client";

import { useState } from "react";
import {
  CheckCircle2, XCircle, Lock, Building2,
  RefreshCw, RotateCcw, AlertTriangle, Clock,
} from "lucide-react";

type User = {
  id:                    string;
  name:                  string;
  email:                 string;
  phone:                 string | null;
  role:                  string;
  businessNumber:        string | null;
  businessName:          string | null;
  businessVerified:      boolean;
  businessStatus:        string | null;
  businessActive:        boolean;
  businessLastCheckedAt: string | null;
  loginAttempts:         number;
  lockedUntil:           string | null;
  lockedMins:            number;
  createdAt:             string;
  createdAtFmt:          string | null;
  businessLastCheckedFmt: string | null;
};

export default function AdminUsersClient({ users: initialUsers }: { users: User[] }) {
  const [users, setUsers]           = useState(initialUsers);
  const [recheckingId, setRecheckingId] = useState<string | null>(null);
  const [recheckingAll, setRecheckingAll] = useState(false);
  const [msg, setMsg]               = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const showMsg = (type: "ok" | "err", text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  };

  // 개별 재검증
  const recheckOne = async (userId: string) => {
    setRecheckingId(userId);
    try {
      const res  = await fetch("/api/admin/recheck-user", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) { showMsg("err", data.error ?? "오류 발생"); return; }

      setUsers((prev) => prev.map((u) =>
        u.id === userId
          ? { ...u, businessStatus: data.status, businessActive: data.isActive, businessLastCheckedFmt: new Date().toLocaleString("ko-KR") }
          : u
      ));
      showMsg("ok", `재검증 완료: ${data.status}`);
    } catch {
      showMsg("err", "네트워크 오류");
    } finally {
      setRecheckingId(null);
    }
  };

  // 전체 재검증 (크론 API 호출)
  const recheckAll = async () => {
    setRecheckingAll(true);
    try {
      const res  = await fetch("/api/cron/recheck-business", {
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET ?? ""}` },
      });
      const data = await res.json();

      if (!res.ok) {
        // 크론 시크릿이 클라이언트에 없으므로 별도 어드민 전체 재검증 엔드포인트 사용
        showMsg("err", "전체 재검증은 서버에서 실행되어야 합니다 (크론 스케줄 사용)");
        return;
      }
      showMsg("ok", `전체 재검증 완료 — ${data.results?.active ?? 0}건 정상, ${data.results?.deactivated ?? 0}건 비활성 처리`);
      setTimeout(() => window.location.reload(), 1500);
    } catch {
      showMsg("err", "전체 재검증 실패");
    } finally {
      setRecheckingAll(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* 상단 툴바 */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">총 {users.length}명</p>
        <button
          onClick={recheckAll}
          disabled={recheckingAll}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-semibold rounded-xl transition-colors"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${recheckingAll ? "animate-spin" : ""}`} />
          {recheckingAll ? "전체 재검증 중..." : "전체 사업자 재검증"}
        </button>
      </div>

      {/* 알림 */}
      {msg && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
          msg.type === "ok" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          {msg.type === "ok" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
          {msg.text}
        </div>
      )}

      {/* 테이블 */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {["이름 / 이메일", "사업자 정보", "인증 상태", "마지막 검증일", "계정", "가입일", "재검증"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isLocked = user.lockedUntil && new Date(user.lockedUntil) > new Date();
                return (
                  <tr key={user.id} className={`border-b border-slate-50 transition-colors ${
                    !user.businessActive && user.businessVerified ? "bg-orange-50/40" : "hover:bg-slate-50/50"
                  }`}>
                    {/* 이름/이메일 */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold shrink-0">
                          {user.name[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{user.name}</p>
                          <p className="text-xs text-slate-400">{user.email}</p>
                          {user.phone && <p className="text-xs text-slate-400">{user.phone}</p>}
                        </div>
                      </div>
                    </td>

                    {/* 사업자 정보 */}
                    <td className="px-4 py-3">
                      {user.businessNumber ? (
                        <div>
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="font-mono text-xs text-slate-700">{user.businessNumber}</span>
                          </div>
                          {user.businessName && <p className="text-xs text-slate-500 mt-0.5">{user.businessName}</p>}
                          {user.businessStatus && (
                            <span className={`text-[11px] font-medium ${
                              user.businessActive ? "text-green-600" : "text-orange-600"
                            }`}>{user.businessStatus}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>

                    {/* 인증 상태 */}
                    <td className="px-4 py-3">
                      {user.businessVerified && user.businessActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs font-semibold rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> 계속사업자
                        </span>
                      ) : user.businessVerified && !user.businessActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-700 text-xs font-semibold rounded-full">
                          <AlertTriangle className="w-3 h-3" /> 비활성
                        </span>
                      ) : user.businessNumber ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full">
                          <XCircle className="w-3 h-3" /> 형식검증만
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">미인증</span>
                      )}
                    </td>

                    {/* 마지막 검증일 */}
                    <td className="px-4 py-3">
                      {user.businessLastCheckedFmt ? (
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Clock className="w-3 h-3" />
                          {user.businessLastCheckedFmt}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">미검증</span>
                      )}
                    </td>

                    {/* 계정 상태 */}
                    <td className="px-4 py-3">
                      {isLocked ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 text-xs font-semibold rounded-full">
                          <Lock className="w-3 h-3" /> {user.lockedMins}분 잠금
                        </span>
                      ) : user.loginAttempts > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-700 text-xs font-semibold rounded-full">
                          실패 {user.loginAttempts}회
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">정상</span>
                      )}
                    </td>

                    {/* 가입일 */}
                    <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                      {user.createdAtFmt}
                    </td>

                    {/* 재검증 버튼 */}
                    <td className="px-4 py-3">
                      {user.businessNumber ? (
                        <button
                          onClick={() => recheckOne(user.id)}
                          disabled={recheckingId === user.id}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 disabled:opacity-50 transition-colors"
                        >
                          <RefreshCw className={`w-3 h-3 ${recheckingId === user.id ? "animate-spin" : ""}`} />
                          {recheckingId === user.id ? "검증중" : "재검증"}
                        </button>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 크론 스케줄 안내 */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-slate-700 mb-1.5">자동 재검증 스케줄</p>
        <p className="text-xs text-slate-500 leading-relaxed">
          운영 서버에서는 매일 새벽 2시에 자동 재검증됩니다.
          Vercel 배포 시 <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">vercel.json</code>에 크론 설정이 필요합니다.
          NTS 무료 한도는 일 1,000건입니다.
        </p>
        <code className="block mt-2 text-[11px] text-slate-600 bg-white border border-slate-200 rounded-lg p-2">
          {`{ "crons": [{ "path": "/api/cron/recheck-business", "schedule": "0 2 * * *" }] }`}
        </code>
      </div>
    </div>
  );
}
