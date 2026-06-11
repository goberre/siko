"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { categories } from "@/lib/data";
import {
  ShoppingCart, Search, Menu, X, ChevronDown,
  Zap, User, LogOut, Settings, Package,
} from "lucide-react";

export default function Header() {
  const { data: session, status } = useSession();
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen]      = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const user = session?.user;
  const isAdmin = user?.role === "admin";

  return (
    <>
      {/* Top Bar */}
      <div className="bg-slate-900 text-slate-400 text-xs py-2 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <span>실사용자 기반 마케팅 플랫폼 · 합리적인 15~20% 마진</span>
          <div className="flex gap-4">
            <Link href="/faq"     className="hover:text-white transition-colors">자주묻는 질문</Link>
            <Link href="/contact" className="hover:text-white transition-colors">1:1 문의</Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={`sticky top-0 z-50 bg-white transition-all duration-200 ${
          scrolled ? "border-b border-slate-200 shadow-sm" : "border-b border-slate-100"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" fill="white" />
              </div>
              <span className="font-bold text-xl text-slate-900 tracking-tight">SIKO</span>
            </Link>

            {/* Desktop Search */}
            <div className="hidden md:flex flex-1 max-w-xl mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="서비스 검색 (예: 인스타그램 팔로워, 플레이스 리뷰...)"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1 shrink-0">
              <Link href="/services" className="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
                전체 서비스
              </Link>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2 ml-auto shrink-0">
              {status === "loading" ? (
                <div className="w-20 h-8 bg-slate-100 rounded-lg animate-pulse" />
              ) : user ? (
                /* 로그인 상태 */
                <div className="relative hidden md:block">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {user.name?.[0]?.toUpperCase() ?? "U"}
                    </div>
                    <span className="text-sm font-medium text-slate-700">{user.name}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-100 rounded-xl shadow-lg py-1.5 z-40">
                        <div className="px-4 py-2.5 border-b border-slate-50">
                          <p className="text-xs font-semibold text-slate-900">{user.name}</p>
                          <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                        </div>
                        {isAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <Settings className="w-3.5 h-3.5 text-slate-400" />
                            관리자 페이지
                          </Link>
                        )}
                        <Link
                          href="/mypage/orders"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <Package className="w-3.5 h-3.5 text-slate-400" />
                          주문 내역
                        </Link>
                        <button
                          onClick={() => { signOut({ callbackUrl: "/" }); setUserMenuOpen(false); }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          로그아웃
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                /* 비로그인 상태 */
                <>
                  <Link
                    href="/login"
                    className="hidden md:flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>로그인</span>
                  </Link>
                  <Link
                    href="/register"
                    className="hidden md:flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    회원가입
                  </Link>
                </>
              )}

              {/* Cart */}
              <Link href="/cart" className="relative p-2 hover:bg-slate-50 rounded-lg transition-colors">
                <ShoppingCart className="w-5 h-5 text-slate-700" />
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  0
                </span>
              </Link>

              {/* Mobile menu toggle */}
              <button
                className="md:hidden p-2 hover:bg-slate-50 rounded-lg transition-colors"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? <X className="w-5 h-5 text-slate-700" /> : <Menu className="w-5 h-5 text-slate-700" />}
              </button>
            </div>
          </div>

          {/* Category Nav */}
          <div className="hidden md:flex items-center gap-1 pb-2 overflow-x-auto">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="relative"
                onMouseEnter={() => setActiveCategory(cat.id)}
                onMouseLeave={() => setActiveCategory(null)}
              >
                <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg whitespace-nowrap transition-colors">
                  {cat.name}
                  <ChevronDown className="w-3 h-3" />
                </button>
                {activeCategory === cat.id && (
                  <div className="absolute top-full left-0 mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50">
                    {cat.subcategories.map((sub) => (
                      <Link
                        key={sub}
                        href={`/services?category=${cat.id}&sub=${encodeURIComponent(sub)}`}
                        className="flex items-center px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                      >
                        {sub}
                      </Link>
                    ))}
                    <div className="mx-4 my-1 border-t border-slate-100" />
                    <Link
                      href={`/services?category=${cat.id}`}
                      className="flex items-center px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors font-medium"
                    >
                      전체보기 ({cat.count}개)
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white">
            <div className="px-4 py-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="서비스 검색..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="px-4 pb-4 space-y-1">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/services?category=${cat.id}`}
                  className="flex items-center justify-between px-3 py-2.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <span>{cat.name}</span>
                  <span className="text-xs text-slate-400">{cat.count}개</span>
                </Link>
              ))}
            </div>
            <div className="px-4 pb-4 flex gap-2">
              {user ? (
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-red-500 font-medium"
                >
                  로그아웃
                </button>
              ) : (
                <>
                  <Link href="/login"    className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 font-medium text-center" onClick={() => setMenuOpen(false)}>로그인</Link>
                  <Link href="/register" className="flex-1 py-2.5 bg-blue-600 rounded-xl text-sm text-white font-medium text-center" onClick={() => setMenuOpen(false)}>회원가입</Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
