// Alternate fresh processes to avoid warmed renderer state or concurrent builds.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { performance } from 'node:perf_hooks';
import { resolve } from 'node:path';

const directory = resolve('experiments/astro-og-takumi');
await mkdir(`${directory}/output`, { recursive: true });
const measurements = [];
for (let trial = 1; trial <= 3; trial++) {
  const engines = trial % 2 ? ['baseline', 'takumi', 'takumi-sharp'] : ['takumi-sharp', 'takumi', 'baseline'];
  for (const engine of engines) {
    const report = `${directory}/output/${engine}-${trial}.json`;
    const env = { ...process.env, OG_BENCH_REPORT: report, OG_RENDER_CONCURRENCY: '8' };
    delete env.OG_BENCH_LIMIT;
    delete env.OG_BENCH_SCALE;
    delete env.OG_BENCH_OUTPUT;
    if (trial === 1) env.OG_BENCH_OUTPUT = `${directory}/output/${engine}`;
    const start = performance.now();
    await new Promise((resolveRun, rejectRun) => {
      const child = spawn(process.execPath, [`${directory}/benchmark.mjs`, engine], { env, stdio: 'inherit' });
      child.on('error', rejectRun);
      child.on('exit', code => code === 0 ? resolveRun() : rejectRun(new Error(`${engine} exited ${code}`)));
    });
    const processMs = performance.now() - start;
    const result = JSON.parse(await readFile(report, 'utf8'));
    const { hashes, ...summary } = result;
    measurements.push({ trial, ...summary, processMs });
    if (measurements.length > 1) {
      for (const field of ['count', 'inputHash', 'fontHash', 'storeHash', 'scale']) {
        assert.equal(summary[field], measurements[0][field], `Inconsistent ${field}`);
      }
    }
  }
}
await writeFile(`${directory}/measurements.json`, JSON.stringify(measurements, null, 2) + '\n');
const median = values => values.toSorted((a, b) => a - b)[Math.floor(values.length / 2)];
for (const engine of ['baseline', 'takumi', 'takumi-sharp']) {
  const runs = measurements.filter(result => result.engine === engine);
  console.log(JSON.stringify({ engine, medianMs: median(runs.map(run => run.wallMs)),
    medianIncludingInitializationMs: median(runs.map(run => run.initializationMs + run.wallMs)),
    bytes: runs[0].bytes, runsMs: runs.map(run => run.wallMs) }));
}
