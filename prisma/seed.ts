/**
 * 최초 어드민 계정 생성 스크립트
 * 실행: npx tsx prisma/seed.ts
 *
 * ⚠️  프로덕션 배포 전 반드시 비밀번호를 변경하세요!
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail    = "admin@siko.kr";
  const adminPassword = "Admin@Siko2026!"; // 첫 로그인 후 반드시 변경

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existing) {
    console.log("✅  어드민 계정이 이미 존재합니다:", adminEmail);
    return;
  }

  const hashed = await bcrypt.hash(adminPassword, 12);
  const admin  = await prisma.user.create({
    data: {
      name:     "관리자",
      email:    adminEmail,
      password: hashed,
      role:     "admin",
    },
  });

  console.log("✅  어드민 계정 생성 완료");
  console.log("   이메일  :", admin.email);
  console.log("   비밀번호:", adminPassword);
  console.log("   ⚠️  첫 로그인 후 반드시 비밀번호를 변경하세요!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
