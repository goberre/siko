/**
 * IP 기반 Rate Limiter (in-memory)
 *
 * Cloudflare Workers는 요청마다 같은 isolate를 재사용하지만,
 * 다중 인스턴스 환경에서는 인스턴스 간 상태가 공유되지 않음.
 * 실 트래픽이 많아지면 Cloudflare Rate Limiting 룰(대시보드)로 보완 권장.
 *
 * 현재 규칙:
 *   - 로그인:       1분에 IP당 20회 (Workers isolate 특성 반영, 넉넉하게)
 *   - 회원가입:     1분에 IP당 5회
 *   - 비번 재설정:  1분에 IP당 3회
 *   - 사업자 확인:  1분에 IP당 10회
 */

type LimitConfig = { max: number; windowMs: number };

const store = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, config: LimitConfig): {
  allowed:   boolean;
  remaining: number;
  resetAt:   number;
} {
  const now   = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true, remaining: config.max - 1, resetAt: now + config.windowMs };
  }

  if (entry.count >= config.max) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: config.max - entry.count, resetAt: entry.resetAt };
}

export const LIMITS = {
  LOGIN:    { max: 20, windowMs: 60 * 1000 },        // 1분 20회
  REGISTER: { max: 5,  windowMs: 60 * 1000 },        // 1분 5회
  VERIFY:   { max: 10, windowMs: 60 * 1000 },        // 1분 10회
  RESET:    { max: 3,  windowMs: 60 * 1000 },        // 1분 3회
};
