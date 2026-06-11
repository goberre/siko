import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ShieldAlert, CheckCircle2, XCircle, Lock, LogIn, UserPlus } from "lucide-react";

export const dynamic = "force-dynamic";

const ACTION_META: Record<string, { label: string; color: string; Icon: React.ElementType }> = {
  LOGIN_SUCCESS:  { label: "로그인 성공",   color: "text-green-600 bg-green-50",  Icon: CheckCircle2 },
  LOGIN_FAIL:     { label: "로그인 실패",   color: "text-red-600 bg-red-50",      Icon: XCircle },
  LOGIN_BLOCKED:  { label: "계정 잠금 차단", color: "text-orange-600 bg-orange-50", Icon: Lock },
  ACCOUNT_LOCKED: { label: "계정 잠금 발생", color: "text-red-700 bg-red-100",     Icon: ShieldAlert },
  REGISTER:       { label: "회원가입",      color: "text-blue-600 bg-blue-50",    Icon: UserPlus },
  REGISTER_FAIL:  { label: "가입 실패",     color: "text-red-600 bg-red-50",      Icon: XCircle },
  ADMIN_ACTION:   { label: "관리자 작업",   color: "text-purple-600 bg-purple-50", Icon: ShieldAlert },
  BUSINESS_VERIFY:{ label: "사업자 인증",   color: "text-teal-600 bg-teal-50",    Icon: CheckCircle2 },
};

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  }).format(new Date(d));
}

export default async function AuditLogsPage() {
  const session = await auth();
  if (!session || session.user.role !== "admin") redirect("/");

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { user: { select: { name: true, email: true } } },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
          <ShieldAlert className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">감사 로그</h1>
          <p className="text-sm text-slate-500">최근 200개 이벤트 · 로그인 / 가입 / 보안 이벤트</p>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <ShieldAlert className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>기록된 이벤트가 없습니다</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {["시각", "이벤트", "사용자", "IP", "상세"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const meta = ACTION_META[log.action] ?? {
                    label: log.action, color: "text-slate-600 bg-slate-50", Icon: LogIn,
                  };
                  const { Icon } = meta;
                  return (
                    <tr key={log.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap font-mono">
                        {fmtDate(log.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${meta.color}`}>
                          <Icon className="w-3 h-3" />
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {log.user ? (
                          <div>
                            <p className="font-medium text-slate-800">{log.user.name}</p>
                            <p className="text-xs text-slate-400">{log.user.email}</p>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400 font-mono">{log.ip ?? "—"}</td>
                      <td className="px-4 py-3 text-xs text-slate-500 max-w-xs truncate">{log.detail ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
