/**
 * Demo mode is active when either:
 *   - DEMO_MODE=true is set in the environment, OR
 *   - No ANTHROPIC_API_KEY is configured (so the app still works for a demo
 *     without requiring any Claude credits).
 */
export function isDemoMode(): boolean {
  const flag = (process.env.DEMO_MODE || '').toLowerCase();
  if (flag === 'true' || flag === '1' || flag === 'yes') return true;
  if (!process.env.ANTHROPIC_API_KEY) return true;
  return false;
}

/** Artificial latency so loading spinners are visible during the demo. */
export async function demoDelay(ms = 900): Promise<void> {
  await new Promise((r) => setTimeout(r, ms));
}
