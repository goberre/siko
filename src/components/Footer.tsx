import Link from "next/link";
import { Zap, Phone, Mail, MessageCircle } from "lucide-react";

const footerLinks = {
  서비스: [
    { label: "전체 서비스", href: "/services" },
    { label: "스토어 마케팅", href: "/services?category=store" },
    { label: "플레이스 마케팅", href: "/services?category=place" },
    { label: "SNS 마케팅", href: "/services?category=sns" },
    { label: "앱 마케팅", href: "/services?category=app" },
  ],
  고객지원: [
    { label: "자주묻는 질문", href: "/faq" },
    { label: "1:1 문의", href: "/contact" },
    { label: "공지사항", href: "/notice" },
    { label: "이용약관", href: "/terms" },
    { label: "개인정보처리방침", href: "/privacy" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" fill="white" />
              </div>
              <span className="font-bold text-xl text-white">SIKO</span>
            </Link>
            <p className="text-sm leading-relaxed mb-5 max-w-sm">
              실사용자 기반 온라인 마케팅 플랫폼. 합리적인 마진으로 최고의 마케팅 서비스를 제공합니다.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-slate-500" />
                <span>고객센터: 운영 준비 중</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-slate-500" />
                <span>contact@siko.kr</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MessageCircle className="w-4 h-4 text-slate-500" />
                <span>카카오톡 채널 문의</span>
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-white mb-3">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 text-xs">
          <p>© 2026 SIKO. All rights reserved.</p>
          <p className="text-slate-600">실사용자 기반 마케팅 서비스 · 합리적인 가격 보장</p>
        </div>
      </div>
    </footer>
  );
}
