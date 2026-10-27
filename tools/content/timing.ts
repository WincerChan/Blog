import { performance } from 'node:perf_hooks';

export const isContentDebug = () => process.env.CONTENT_DEBUG === '1';

export function createContentTimer() {
  const enabled = isContentDebug();
  const starts = new Map<string, number>();
  return {
    start(label: string) {
      if (enabled) starts.set(label, performance.now());
    },
    end(label: string) {
      const start = starts.get(label);
      if (start === undefined) return;
      starts.delete(label);
      console.log(`${label}: ${(performance.now() - start).toFixed(3)}ms`);
    },
  };
}
