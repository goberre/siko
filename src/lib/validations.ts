import { z } from "zod";
import { validateBusinessNumberFormat } from "@/lib/businessNumber";

// 비밀번호 규칙: 8자 이상, 대소문자·숫자·특수문자 각 1개 이상
const passwordSchema = z
  .string()
  .min(8, "비밀번호는 최소 8자 이상이어야 합니다")
  .regex(/[A-Z]/, "대문자를 1개 이상 포함해야 합니다")
  .regex(/[a-z]/, "소문자를 1개 이상 포함해야 합니다")
  .regex(/[0-9]/, "숫자를 1개 이상 포함해야 합니다")
  .regex(/[^A-Za-z0-9]/, "특수문자를 1개 이상 포함해야 합니다");

export const registerSchema = z
  .object({
    name: z.string().min(2, "이름은 최소 2자 이상이어야 합니다").max(50, "이름은 50자 이하여야 합니다"),
    email: z.string().email("올바른 이메일 형식이 아닙니다"),
    phone: z.string().regex(/^01[0-9]-\d{4}-\d{4}$/, "전화번호 형식: 010-0000-0000").optional().or(z.literal("")),
    // 사업자 정보
    businessNumber: z
      .string()
      .min(1, "사업자등록번호를 입력해주세요")
      .refine(validateBusinessNumberFormat, "올바르지 않은 사업자등록번호입니다"),
    businessName: z.string().min(1, "상호명을 입력해주세요").max(100, "상호명은 100자 이하여야 합니다"),
    businessVerified: z
      .boolean()
      .refine((v) => v === true, "사업자등록번호 인증을 먼저 완료해주세요"),
    password: passwordSchema,
    confirmPassword: z.string(),
    agreeTerms: z
      .boolean()
      .refine((v) => v === true, "이용약관에 동의해주세요"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email:    z.string().email("올바른 이메일 형식이 아닙니다"),
  password: z.string().min(1, "비밀번호를 입력해주세요"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput    = z.infer<typeof loginSchema>;

// 비밀번호 강도 분석
export function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8)                                       score++;
  if (password.length >= 12)                                      score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password))          score++;
  if (/[0-9]/.test(password))                                     score++;
  if (/[^A-Za-z0-9]/.test(password))                             score++;

  const levels = [
    { label: "매우 약함", color: "bg-red-500" },
    { label: "약함",     color: "bg-orange-500" },
    { label: "보통",     color: "bg-yellow-500" },
    { label: "강함",     color: "bg-blue-500" },
    { label: "매우 강함", color: "bg-green-500" },
  ];
  return { score, ...levels[Math.min(score, 4)] };
}
