// @ts-ignore `.open-next/worker.ts` is generated at build time
import { default as handler } from "./.open-next/worker.js";

export default {
  fetch: handler.fetch,

  /**
   * Cloudflare Cron Trigger - 사업자 재검증 자동화
   * 스케줄: 매일 새벽 2시 (UTC 17:00 = KST 02:00)
   * wrangler.jsonc > triggers.crons 에서 설정
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async scheduled(event: { cron: string }, env: CloudflareEnv, ctx: any) {
    const baseUrl = (env as Record<string, string>).NEXTAUTH_URL ?? "https://siko.goberre.workers.dev";
    const cronSecret = (env as Record<string, string>).CRON_SECRET;

    if (!cronSecret) {
      console.error("[cron] CRON_SECRET 미설정 - 실행 중단");
      return;
    }

    console.log(`[cron] 사업자 재검증 시작 - ${new Date().toISOString()}`);

    try {
      const res = await fetch(`${baseUrl}/api/cron/recheck-business`, {
        method: "GET",
        headers: { Authorization: `Bearer ${cronSecret}` },
      });

      const data = await res.json() as Record<string, unknown>;
      console.log(`[cron] 완료: checked=${data.checked}, elapsed=${data.elapsed}`);
      console.log("[cron] 결과:", JSON.stringify(data.results));
    } catch (err) {
      console.error("[cron] 오류:", err);
    }
  },
};

// @ts-ignore `.open-next/worker.ts` is generated at build time
export { DOQueueHandler, DOShardedTagCache } from "./.open-next/worker.js";
