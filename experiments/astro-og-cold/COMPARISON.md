# Cold OG generation: asynchronous lossless PNG encoding

Measured locally on 2026-10-13 on `codex/astro-solid-experiment`. This follows the cache-only experiment in `../astro-og/COMPARISON.md`.

## Full production builds

Commands: `bun run clean:og`, then `/usr/bin/time -p env NODE_ENV=production bun run build`. Three sequential runs before the change, then three after; no simultaneous benchmark work. Each cold run renders all 103 PNGs. Only the OG cache is cleared; this is not a fresh install or an OS-cache-cold benchmark. Startup, content sync, the real read-only mapping API, Vite, HTML, PNGs and service worker are included in wall time.

| Encoder | Full-build runs (s) | Median (s) | OG-stage runs (s) | OG median (s) |
| --- | --- | --- | --- | --- |
| resvg synchronous `asPng()` | 10.20, 9.39, 9.63 | 9.63 | 4.240, 4.207, 4.272 | 4.240 |
| Sharp asynchronous PNG, level 6 | 9.17, 7.90, 8.21 | 8.21 | 2.893, 2.952, 2.994 | 2.952 |

The full-build median improves by **1.42 s / 14.7%**; the OG-stage median improves by **1.288 s / 30.4%**. Full-build timings include variable startup and network work; these are local measurements, not guaranteed CI times.

A retained-cache follow-up builds the whole site in **5.07 s**, with **103 hits / 0 renders**, and OG preparation takes **19 ms**. The encoder is still loaded only on cache misses.

## Why it helps

`renderAsync()` rasterizes off-thread, but the subsequent `rendered.asPng()` synchronously compresses the PNG on the JavaScript thread. The isolated baseline measured **1.638 s** of synchronous encoding across 104 calls (103 cards plus the shared background). Raising card concurrency cannot parallelize that synchronous JavaScript-thread work.

The change keeps Satori layout, resvg rasterization, the existing background reuse, dimensions, URLs and concurrency. It passes resvg's RGBA pixels to Sharp for asynchronous lossless PNG encoding. No quantization, palette conversion, resizing or image-quality reduction is used. Sharp already exists through Astro; it is now declared directly at the same installed version (`^0.35.4`) because application code imports it. Its package metadata is included in the renderer cache fingerprint, together with the lockfile and renderer source.

## Isolated experiments

`benchmark.mjs` loads the current sanitized content store and normalizes site configuration through the production helper, then renders all 103 real OG targets with Node, as Astro does. It excludes module/font loading, persistent-cache work and full-site output. These are one-run probes to select a candidate, not equivalent to full-build timing or statistically significant comparisons between close results.

| Encoder / setting | OG benchmark (s) | Total PNG bytes |
| --- | --- | --- |
| resvg, 4 cards in flight | 4.101 | 13,341,564 |
| resvg, 8 cards (current default) | 3.981 | 13,341,564 |
| resvg, 16 cards | 3.979 | 13,341,564 |
| resvg, 8 cards, `UV_THREADPOOL_SIZE=8` | 4.051 | 13,341,564 |
| Sharp level 1, 8 cards | 2.544 | 20,984,336 |
| Sharp level 3, 8 cards | 2.598 | 13,087,799 |
| **Sharp level 6, 8 cards** | **2.634** | **11,037,736** |

Level 6 retains most of the speed gain and yields the smallest files among the tested levels. Increasing concurrency or the native pool alone did not show a useful improvement. No production concurrency setting was changed.

`rasterWait` and `svgWait` in the JSON files sum overlapping async durations, including queue/event-loop delays; they are NOT exclusive CPU times and must not be added to wall time. `encode` measures only synchronous `asPng()` duration. A zero `encode` for Sharp means that path was not called, not that Sharp compression takes no time.

Early exploratory probes used unnormalized site configuration; their outputs were discarded. All retained profile JSON files were regenerated with the production `readSiteConf` helper and have the same total PNG bytes as the corresponding production build.

## Verification

- All 103 output filenames match; decoding the before/after production PNGs yields identical dimensions and RGBA bytes for every image. Their encoded PNG bytes differ, as expected.
- Production PNG total: **13,341,564 → 11,037,736 bytes**, a **17.3%** decrease. These are OG assets; they do not reduce ordinary page JS or cause additional browser requests.
- Added a regression test for RGBA preservation, transparency and requested output dimensions against resvg's pixels.
- Full suite: **76 tests / 196 assertions pass**. Output checker: 102 content routes + 404, static assets, service worker and encrypted-content checks pass.
- Production builds pass; whole-project typechecking was not repeated in this experiment (the prior migration report records existing type errors).
- `git diff --check` passes. No commit or push. Existing unrelated migration and `.env` changes preserved.

## Reproduce

After a production build has populated `.astro/data-store.json`, run these sequentially:

```sh
OG_BENCH_ENCODER=resvg node experiments/astro-og-cold/benchmark.mjs
node experiments/astro-og-cold/benchmark.mjs
OG_BENCH_COMPRESSION=3 node experiments/astro-og-cold/benchmark.mjs
```

Use `OG_RENDER_CONCURRENCY` / `UV_THREADPOOL_SIZE` for the pool probes. `OG_BENCH_OUTPUT=/absolute/output/path` saves numbered PNGs. Compare directories with:

```sh
node experiments/astro-og-cold/compare-pixels.mjs /path/to/before /path/to/after
```

## Further work not performed

The remaining cold OG work includes Satori layout and resvg rasterization. Static-layout reuse or worker-based layout would require separate profiling and image-equivalence checks; no speed guarantee is established here. The full site's content-sync/Markdown/API work also remains separate from this optimization. A renderer replacement is not necessary for the measured improvement and was not attempted.
