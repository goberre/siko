import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Users, CheckCircle2, XCircle, Lock, Building2 } from "lucide-react";
import AdminUsersClient from "./AdminUsersClient";

export const dynamic = "force-dynamic";

function fmtDate(d: Date | null) {
  if (!d) return null;
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).format(new Date(d));
}

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session || session.user.role !== "admin") redirect("/");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, email: true, phone: true, role: true,
      businessNumber: true, businessName: true,
      businessVerified: true, businessStatus: true,
      businessActive: true, businessLastCheckedAt: true,
      loginAttempts: true, lockedUntil: true, createdAt: true,
    },
  });

  const total      = users.length;
  const verified   = users.filter((u) => u.businessVerified).length;
  const inactive   = users.filter((u) => !u.businessActive && u.businessVerified).length;
  const locked     = users.filter((u) => u.lockedUntil && u.lockedUntil > new Date()).length;

  const serialized = users.map((u) => ({
    ...u,
    lockedUntil:           u.lockedUntil?.toISOString() ?? null,
    createdAt:             u.createdAt.toISOString(),
    businessLastCheckedAt: u.businessLastCheckedAt?.toISOString() ?? null,
    lockedMins: u.lockedUntil && u.lockedUntil > new Date()
      ? Math.ceil((new Date(u.lockedUntil).getTime() - Date.now()) / 60_000)
      : 0,
    createdAtFmt:             fmtDate(u.createdAt),
    businessLastCheckedFmt:   fmtDate(u.businessLastCheckedAt),
  }));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">회원 관리</h1>
        <p className="text-sm text-slate-500 mt-0.5">사업자 인증 회원 현황</p>
      </div>

      {/* 요약 */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-4">
          <p className="text-xs text-slate-500 mb-1">전체 회원</p>
          <p className="text-2xl font-bold text-slate-900">{total}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-4">
          <p className="text-xs text-slate-500 mb-1">국세청 인증</p>
          <p className="text-2xl font-bold text-green-600">{verified}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-4">
          <p className="text-xs text-slate-500 mb-1">비활성 (폐업/휴업)</p>
          <p className="text-2xl font-bold text-orange-500">{inactive}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-4">
          <p className="text-xs text-slate-500 mb-1">계정 잠금</p>
          <p className="text-2xl font-bold text-red-500">{locked}</p>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 flex flex-col items-center justify-center py-24 text-center">
          <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
            <Users className="w-7 h-7 text-slate-300" />
          </div>
          <p className="text-sm font-semibold text-slate-500">아직 가입한 회원이 없습니다</p>
        </div>
      ) : (
        <AdminUsersClient users={serialized} />
      )}
    </div>
  );
}
