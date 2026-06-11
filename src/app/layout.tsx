import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SessionProvider from "@/components/SessionProvider";

export const metadata: Metadata = {
  title: "SIKO - 합리적인 온라인 마케팅 플랫폼",
  description:
    "스토어, 플레이스, SNS, 앱 마케팅을 한 곳에서. 실사용자 기반 마케팅 서비스를 합리적인 가격으로 이용하세요.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen flex flex-col">
        <SessionProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
