import { prisma } from "@/lib/prisma";

export type AuditAction =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAIL"
  | "LOGIN_BLOCKED"         // 계정 잠금 상태
  | "ACCOUNT_LOCKED"        // 잠금 트리거
  | "REGISTER"
  | "REGISTER_FAIL"
  | "BUSINESS_VERIFY"
  | "PASSWORD_RESET_REQUEST"
  | "PASSWORD_RESET"
  | "ADMIN_ACTION";

export async function writeAuditLog(params: {
  action:    AuditAction;
  userId?:   string;
  ip?:       string;
  userAgent?: string;
  detail?:   string;
}) {
  try {
    await prisma.auditLog.create({ data: params });
  } catch (e) {
    // 감사 로그 실패가 본 기능을 막지 않도록 처리
    console.error("[AuditLog] write failed", e);
  }
}
