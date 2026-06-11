/**
 * IP 기반 Rate Limiter (in-memory)
 *
 * 한계: 서버 재시작 시 초기화됨.
 * 프로덕션에서는 Upstash Redis (@upstash/ratelimit) 교체 권장.
 *
 * 현재 규칙:
 *   - 로그인:    10분에 IP당 10회
 *   - 회원가입:  10분에 IP당 5회
 *   - 비번 재설정: 10분에 IP당 3회
 */

type LimitConfig = { max: number; windowMs: number };

const store = new Map<string, { count: number; resetAt: number }>();

// 오래된 엔트리 정리 (1시간마다)
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of store) {
    if (now > v.resetAt) store.delete(k);
  }
}, 60 * 60 * 1000);

export function checkRateLimit(key: string, config: LimitConfig): {
  allowed:     boolean;
  remaining:   number;
  resetAt:     number;
} {
  const now = Date.now();
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
  LOGIN:    { max: 10, windowMs: 10 * 60 * 1000 },
  REGISTER: { max: 5,  windowMs: 10 * 60 * 1000 },
  VERIFY:   { max: 10, windowMs:      60 * 1000  },
};
