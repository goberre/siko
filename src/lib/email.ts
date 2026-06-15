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
