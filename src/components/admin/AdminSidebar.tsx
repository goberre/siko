"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, ShoppingBag, ClipboardList, Users,
  Settings, Zap, Menu, TrendingUp, Bell, ChevronRight,
  LogOut, ShieldAlert, X,
} from "lucide-react";
import AdminVersionBadge from "@/components/admin/AdminVersionBadge";

const navItems = [
  { href: "/admin",            label: "대시보드",  icon: LayoutDashboard, exact: true },
  { href: "/admin/services",   label: "서비스 관리", icon: ShoppingBag },
  { href: "/admin/orders",     label: "주문 관리",  icon: ClipboardList },
  { href: "/admin/users",      label: "회원 관리",  icon: Users },
  { href: "/admin/audit-logs", label: "감사 로그",  icon: ShieldAlert },
  { href: "/admin/settings",   label: "설정",      icon: Settings },
];

type Props = {
  userName: string;
  userEmail: string;
};

export default function AdminSidebar({ userName, userEmail }: Props) {
  const pathname      = usePathname();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const isActive = (item: (typeof navItems)[0]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  const currentLabel = navItems.find((n) => isActive(n))?.label ?? "관리자";

  const handleLogout = async () => {
    setLoggingOut(true);
    await signOut({ callbackUrl: "/login" });
  };

  const initial = userName?.[0]?.toUpperCase() ?? "A";

  const sidebar = (
    <aside className="w-60 bg-slate-900 flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-slate-800 shrink-0">
        <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
          <Zap className="w-3.5 h-3.5 text-white" fill="white" />
        </div>
        <span className="font-bold text-white">SIKO</span>
        <span className="ml-auto text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">관리자</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 border-t border-slate-800 pt-3 space-y-1">
        <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
          <TrendingUp className="w-4 h-4" />
          <span>사이트 보기</span>
          <ChevronRight className="w-3 h-3 ml-auto" />
        </Link>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-all disabled:opacity-50"
        >
          <LogOut className="w-4 h-4" />
          <span>{loggingOut ? "로그아웃 중..." : "로그아웃"}</span>
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop static sidebar */}
      <div className="hidden lg:flex lg:w-60 lg:flex-col lg:fixed lg:inset-y-0 lg:z-50">
        {sidebar}
      </div>

      {/* Mobile overlay sidebar */}
      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 flex flex-col lg:hidden">
            {sidebar}
          </div>
        </>
      )}

      {/* Top bar */}
      <header className="lg:pl-60 fixed top-0 right-0 left-0 z-30 h-16 bg-white border-b border-slate-100 flex items-center px-4 gap-4">
        <button className="lg:hidden p-2 rounded-lg hover:bg-slate-100" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5 text-slate-600" /> : <Menu className="w-5 h-5 text-slate-600" />}
        </button>

        <span className="text-sm font-semibold text-slate-900 truncate">{currentLabel}</span>

        <div className="hidden lg:flex flex-1 justify-center">
          <AdminVersionBadge />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button className="relative p-2 rounded-lg hover:bg-slate-100">
            <Bell className="w-[18px] h-[18px] text-slate-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <div className="flex items-center gap-2 pl-2 border-l border-slate-100">
            <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">{initial}</span>
            </div>
            <div className="hidden sm:block text-right">
              <p className="text-xs font-semibold text-slate-800 leading-none">{userName}</p>
              <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[120px]">{userEmail}</p>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
