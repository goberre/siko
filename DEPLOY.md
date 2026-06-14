# SIKO 배포 가이드

## 배포 구성

```
GitHub (코드) → Cloudflare Pages (호스팅) + Neon (PostgreSQL DB)
```

---

## Step 1: Neon 데이터베이스 생성 (5분)

1. [https://neon.tech](https://neon.tech) 접속 → **GitHub으로 무료 가입**
2. **New Project** → 프로젝트명: `siko` → Region: `AWS Asia Pacific (Singapore)` 선택
3. 생성 완료 후 **Connection string** 복사 (형식: `postgresql://...`)
4. DB 스키마 적용:
   ```bash
   # 로컬에서 실행 (DATABASE_URL을 Neon 주소로 교체)
   DATABASE_URL="postgresql://..." npx prisma migrate deploy
   DATABASE_URL="postgresql://..." npx tsx prisma/seed.ts
   ```

---

## Step 2: Cloudflare Workers 프로젝트 연결 (10분)

> 이 프로젝트는 `@opennextjs/cloudflare` 어댑터로 **Cloudflare Workers**에 배포합니다.
> (Pages 아님 — Workers입니다. Node.js 런타임 지원으로 Prisma/bcrypt가 그대로 동작합니다.)

1. [https://dash.cloudflare.com](https://dash.cloudflare.com) 로그인
2. **Workers & Pages** → **Create** → **Workers** → **Import a repository** (Git 연결)
3. GitHub 계정 연결 → `goberre/siko` 레포 선택
4. **Build settings**:
   - Build command: `npm run cf:build`
   - Deploy command: `npx wrangler deploy`
5. **Environment variables & Secrets** 에 아래 값 추가:

   | 키 | 값 |
   |----|----|
   | `DATABASE_URL` | Neon 연결 문자열 |
   | `AUTH_SECRET` | 랜덤 64바이트 base64 |
   | `NEXTAUTH_SECRET` | AUTH_SECRET과 동일 |
   | `NEXTAUTH_URL` | 배포 후 실제 `*.workers.dev` 주소 |
   | `NTS_SERVICE_KEY` | 국세청 API 키 |
   | `CRON_SECRET` | 랜덤 32바이트 hex |

6. **Save and Deploy** 클릭

### 로컬에서 직접 배포 (대안)
```bash
npx wrangler login          # 브라우저 인증 1회
npm run cf:deploy           # 빌드 + 배포 한 번에
```

---

## Step 3: GitHub Actions Secrets 설정 (자동 배포)

GitHub 레포 → **Settings** → **Secrets and variables** → **Actions** 에 추가:

| Secret 이름 | 값 |
|-------------|----|
| `DATABASE_URL` | Neon 연결 문자열 |
| `AUTH_SECRET` | 랜덤 시크릿 |
| `NEXTAUTH_SECRET` | AUTH_SECRET과 동일 |
| `NEXTAUTH_URL` | Cloudflare Pages URL |
| `NTS_SERVICE_KEY` | 국세청 API 키 |
| `CRON_SECRET` | 크론 시크릿 |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API 토큰 (아래 참고) |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare 계정 ID |

### Cloudflare API 토큰 발급
1. Cloudflare 대시보드 → 우상단 프로필 → **My Profile** → **API Tokens**
2. **Create Token** → **Custom token**
3. Permissions: `Account > Cloudflare Pages > Edit`
4. 생성 후 토큰 복사

### Cloudflare 계정 ID 확인
- Cloudflare 대시보드 우측 사이드바 하단에 표시됨

---

## Step 4: 커스텀 도메인 연결 (선택)

1. Cloudflare Pages → 프로젝트 → **Custom domains**
2. 도메인 입력 → Cloudflare DNS에 자동 설정됨
3. `NEXTAUTH_URL` 환경변수를 실제 도메인으로 업데이트

---

## 사업자 재검증 크론 설정

Cloudflare Pages 배포 후 매일 자동 실행:
```json
// vercel.json 대신 Cloudflare Cron Triggers 사용
// Cloudflare 대시보드 → Workers & Pages → siko → Triggers → Cron Triggers
// 0 2 * * *  →  /api/cron/recheck-business
// Authorization 헤더: Bearer <CRON_SECRET>
```

---

## 로컬 개발 환경

```bash
# .env 파일 설정 (.env.example 참고)
cp .env.example .env
# DATABASE_URL을 Neon dev branch URL 또는 로컬 PostgreSQL로 변경

npm install
npx prisma migrate dev
npx tsx prisma/seed.ts
npm run dev
```
