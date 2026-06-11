import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata = {
  robots: "noindex, nofollow",   // 검색엔진 어드민 인덱싱 차단
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // 서버에서 이중 인증 검사 (미들웨어 + 레이아웃)
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    redirect("/login?callbackUrl=/admin");
  }

  const userName  = session.user.name  ?? "관리자";
  const userEmail = session.user.email ?? "";

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar userName={userName} userEmail={userEmail} />
      {/* 데스크탑에서 사이드바 너비(240px)만큼 padding */}
      <main className="lg:pl-60 pt-16 min-h-screen overflow-auto">
        {children}
      </main>
    </div>
  );
}
