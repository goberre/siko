import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { loginSchema } from "@/lib/validations";
import { authConfig } from "@/auth.config";
import { writeAuditLog } from "@/lib/auditLog";
import type { DefaultSession } from "next-auth";

// ── 타입 확장 ─────────────────────────────────────────────

declare module "next-auth" {
  interface Session {
    user: { id: string; role: string; businessVerified: boolean } & DefaultSession["user"];
  }
  interface User {
    role:             string;
    businessVerified: boolean;
  }
}

// next-auth v5 JWT 타입은 next-auth 모듈에서 직접 확장
declare module "next-auth" {
  interface JWT {
    id?:               string;
    role?:             string;
    businessVerified?: boolean;
  }
}

// ── 계정 잠금 설정 ────────────────────────────────────────

const MAX_ATTEMPTS   = 5;                   // 최대 실패 횟수
const LOCKOUT_MINS   = 30;                  // 잠금 시간 (분)

export const { handlers, auth, signIn, signOut } = NextAuth({
  pages:     authConfig.pages,
  callbacks: authConfig.callbacks,
  session:   { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 }, // 7일
  trustHost: true,

  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email:    { label: "이메일",   type: "email" },
        password: { label: "비밀번호", type: "password" },
      },
      async authorize(credentials, req) {
        try {
        const ip = (req as Request & { headers?: Headers })
          ?.headers?.get?.("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

        // 1. 입력값 검사
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        // 2. 유저 조회
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          await writeAuditLog({ action: "LOGIN_FAIL", ip, detail: `존재하지 않는 이메일: ${email}` });
          return null;
        }

        // 3. 계정 잠금 확인
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          const remaining = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60_000);
          await writeAuditLog({
            action:  "LOGIN_BLOCKED",
            userId:  user.id,
            ip,
            detail:  `잠금 ${remaining}분 남음`,
          });
          return null;
        }

        // 4. 비밀번호 검증 (timing-safe)
        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
          const newAttempts = user.loginAttempts + 1;
          const shouldLock  = newAttempts >= MAX_ATTEMPTS;

          await prisma.user.update({
            where: { id: user.id },
            data: {
              loginAttempts: newAttempts,
              lockedUntil:   shouldLock
                ? new Date(Date.now() + LOCKOUT_MINS * 60_000)
                : user.lockedUntil,
            },
          });

          if (shouldLock) {
            await writeAuditLog({
              action:  "ACCOUNT_LOCKED",
              userId:  user.id,
              ip,
              detail:  `${MAX_ATTEMPTS}회 실패 → ${LOCKOUT_MINS}분 잠금`,
            });
          } else {
            await writeAuditLog({
              action:  "LOGIN_FAIL",
              userId:  user.id,
              ip,
              detail:  `비밀번호 불일치 (${newAttempts}/${MAX_ATTEMPTS}회)`,
            });
          }
          return null;
        }

        // 5. 성공 — 실패 카운터 초기화
        await prisma.user.update({
          where: { id: user.id },
          data:  { loginAttempts: 0, lockedUntil: null },
        });

        await writeAuditLog({ action: "LOGIN_SUCCESS", userId: user.id, ip });

        return {
          id:               user.id,
          name:             user.name,
          email:            user.email,
          role:             user.role,
          image:            user.image,
          businessVerified: user.businessVerified,
        };
        } catch (e) {
          console.error("[Auth] authorize failed", e);
          return null;
        }
      },
    }),
  ],

  cookies: {
    sessionToken: {
      options: {
        httpOnly: true,
        sameSite: "lax",
        path:     "/",
        secure:   true,
      },
    },
  },
});
