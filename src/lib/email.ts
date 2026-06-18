import { Resend } from "resend";

// 빌드 타임에 초기화하지 않고, 호출 시 생성
function getResend() {
  if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY 미설정");
  return new Resend(process.env.RESEND_API_KEY);
}

// 발신자 이메일 주소 (Resend 대시보드에서 도메인 인증 후 변경)
const FROM_EMAIL = process.env.EMAIL_FROM ?? "onboarding@resend.dev";
const SITE_NAME  = "SIKO";

export async function sendPasswordResetEmail({
  to,
  name,
  resetUrl,
}: {
  to: string;
  name: string;
  resetUrl: string;
}) {
  const resend = getResend();
  const { data, error } = await resend.emails.send({
    from: `${SITE_NAME} <${FROM_EMAIL}>`,
    to,
    subject: `[${SITE_NAME}] 비밀번호 재설정 링크`,
    html: `
<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Apple SD Gothic Neo',sans-serif;">
  <div style="max-width:520px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
    <!-- Header -->
    <div style="background:#2563eb;padding:32px 40px;">
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">${SITE_NAME}</h1>
      <p style="margin:6px 0 0;color:#bfdbfe;font-size:13px;">마케팅 서비스 플랫폼</p>
    </div>
    <!-- Body -->
    <div style="padding:40px;">
      <p style="margin:0 0 16px;color:#1e293b;font-size:15px;"><strong>${name}</strong>님, 안녕하세요.</p>
      <p style="margin:0 0 24px;color:#475569;font-size:14px;line-height:1.7;">
        비밀번호 재설정 요청을 받았습니다.<br/>
        아래 버튼을 클릭하여 비밀번호를 재설정하세요.<br/>
        이 링크는 <strong>1시간</strong> 동안 유효합니다.
      </p>
      <!-- CTA Button -->
      <div style="text-align:center;margin:32px 0;">
        <a href="${resetUrl}"
           style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:10px;font-size:15px;font-weight:600;">
          비밀번호 재설정
        </a>
      </div>
      <p style="margin:24px 0 0;color:#94a3b8;font-size:12px;line-height:1.7;">
        이 요청을 본인이 하지 않았다면 이 메일을 무시하셔도 됩니다.<br/>
        링크를 클릭하지 않는 한 비밀번호는 변경되지 않습니다.
      </p>
    </div>
    <!-- Footer -->
    <div style="padding:20px 40px;background:#f1f5f9;border-top:1px solid #e2e8f0;">
      <p style="margin:0;color:#94a3b8;font-size:11px;">© ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
  });

  if (error) {
    console.error("[Resend] 이메일 발송 실패:", error);
    throw new Error("이메일 발송 실패");
  }

  return data;
}

// ── 주문 확인 이메일 (고객용) ──────────────────────────────
export async function sendOrderConfirmationEmail({
  to, name, orderId, serviceName, tier, amount, requestUrl,
}: {
  to: string; name: string; orderId: string;
  serviceName: string; tier: string; amount: number; requestUrl: string;
}) {
  const resend = getResend();
  const { error } = await resend.emails.send({
    from: `${SITE_NAME} <${FROM_EMAIL}>`,
    to,
    subject: `[${SITE_NAME}] 주문이 접수되었습니다`,
    html: `
<!DOCTYPE html><html lang="ko">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Apple SD Gothic Neo',sans-serif;">
  <div style="max-width:520px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
    <div style="background:#2563eb;padding:32px 40px;">
      <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">${SITE_NAME}</h1>
      <p style="margin:6px 0 0;color:#bfdbfe;font-size:13px;">주문 접수 확인</p>
    </div>
    <div style="padding:40px;">
      <p style="margin:0 0 20px;color:#1e293b;font-size:15px;"><strong>${name}</strong>님, 주문이 정상적으로 접수되었습니다!</p>
      <div style="background:#f1f5f9;border-radius:12px;padding:20px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <tr><td style="padding:6px 0;color:#64748b;width:40%;">주문번호</td><td style="padding:6px 0;color:#1e293b;font-weight:600;">${orderId.slice(-8).toUpperCase()}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;">서비스</td><td style="padding:6px 0;color:#1e293b;">${serviceName}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;">플랜</td><td style="padding:6px 0;color:#1e293b;">${tier}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;">금액</td><td style="padding:6px 0;color:#2563eb;font-weight:700;">${amount.toLocaleString()}원~</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;">작업 URL</td><td style="padding:6px 0;color:#1e293b;word-break:break-all;">${requestUrl}</td></tr>
        </table>
      </div>
      <p style="margin:0 0 24px;color:#475569;font-size:14px;line-height:1.7;">
        결제 확인 후 <strong>24시간 이내</strong> 작업이 시작됩니다.<br/>
        진행 상황은 마이페이지에서 확인하실 수 있습니다.
      </p>
      <div style="text-align:center;">
        <a href="${process.env.NEXTAUTH_URL}/dashboard" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 32px;border-radius:10px;font-size:14px;font-weight:600;">마이페이지 확인하기</a>
      </div>
    </div>
    <div style="padding:20px 40px;background:#f1f5f9;border-top:1px solid #e2e8f0;">
      <p style="margin:0;color:#94a3b8;font-size:11px;">© ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.</p>
    </div>
  </div>
</body></html>`.trim(),
  });
  if (error) console.error("[Resend] 주문 확인 이메일 실패:", error);
}

// ── 새 주문 알림 이메일 (관리자용) ────────────────────────
export async function sendAdminOrderNotificationEmail({
  orderId, customerName, customerEmail,
  serviceName, tier, amount, requestUrl, requestKeyword, requestMemo,
}: {
  orderId: string; customerName: string; customerEmail: string;
  serviceName: string; tier: string; amount: number;
  requestUrl: string; requestKeyword?: string; requestMemo?: string;
}) {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@siko.kr";
  const resend = getResend();
  const { error } = await resend.emails.send({
    from: `${SITE_NAME} <${FROM_EMAIL}>`,
    to: adminEmail,
    subject: `[SIKO 관리자] 새 주문 접수 - ${serviceName}`,
    html: `
<!DOCTYPE html><html lang="ko">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Apple SD Gothic Neo',sans-serif;">
  <div style="max-width:520px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
    <div style="background:#0f172a;padding:28px 40px;">
      <h1 style="margin:0;color:#fff;font-size:18px;font-weight:700;">🛎 새 주문이 접수되었습니다</h1>
    </div>
    <div style="padding:32px 40px;">
      <div style="background:#f1f5f9;border-radius:12px;padding:20px;margin-bottom:20px;">
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <tr><td style="padding:6px 0;color:#64748b;width:35%;">주문번호</td><td style="padding:6px 0;font-weight:600;">${orderId.slice(-8).toUpperCase()}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;">고객명</td><td style="padding:6px 0;">${customerName}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;">이메일</td><td style="padding:6px 0;">${customerEmail}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;">서비스</td><td style="padding:6px 0;">${serviceName}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;">플랜</td><td style="padding:6px 0;">${tier}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;">금액</td><td style="padding:6px 0;color:#2563eb;font-weight:700;">${amount.toLocaleString()}원~</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;">작업 URL</td><td style="padding:6px 0;word-break:break-all;">${requestUrl}</td></tr>
          ${requestKeyword ? `<tr><td style="padding:6px 0;color:#64748b;">키워드</td><td style="padding:6px 0;">${requestKeyword}</td></tr>` : ""}
          ${requestMemo ? `<tr><td style="padding:6px 0;color:#64748b;">요청사항</td><td style="padding:6px 0;">${requestMemo}</td></tr>` : ""}
        </table>
      </div>
      <div style="text-align:center;">
        <a href="${process.env.NEXTAUTH_URL}/admin/orders" style="display:inline-block;background:#0f172a;color:#fff;text-decoration:none;padding:12px 32px;border-radius:10px;font-size:14px;font-weight:600;">관리자 페이지에서 확인</a>
      </div>
    </div>
  </div>
</body></html>`.trim(),
  });
  if (error) console.error("[Resend] 관리자 알림 이메일 실패:", error);
}
