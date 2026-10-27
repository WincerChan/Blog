# Production migration to Takumi native PNG

Implemented on 2026-10-26 on `codex/astro-solid-experiment`, based on
`0d3b92b2ef419c6ae54804311ed54abab266835d`, after the comparison in
[COMPARISON.md](COMPARISON.md).

## Implementation

- Added `@takumi-rs/core` and `@takumi-rs/helpers`, pinned to 2.18.1, for native
  rendering/PNG encoding and JSX conversion. The production dependency graph
  does not include the Takumi WASM distribution or require React.
- Removed Satori from production dependencies and removed the old OG-specific
  SVG layer extraction/compositing code. resvg and Sharp remain for favicons.
- Retained the existing template, fonts, routes, 1200 × 630 logical canvas,
  1.5× rendering scale and 1800 × 945 PNG output. Full-canvas SVG decorations
  now have numeric dimensions, as required by the JSX converter.
- One lazily initialized native renderer shares registered fonts across
  concurrent cache misses. Cache hits do not initialize it; failed
  initialization can be retried.
- Retained the disk cache and concurrency policy. Cache fingerprints now cover
  the Takumi adapter, helpers and installed native dependency, replacing the
  old Satori/resvg/Sharp graph. Existing cache files are preserved.

## Verification

On Node v24.12.0 / macOS arm64 / Apple M3:

| Production build | OG stage | Whole command wall time |
| --- | --- | --- |
| First build after migration | 103 rendered, 0 cached; **1,155 ms** | 6.21 s |
| Second build | 0 rendered, 103 cached; **40 ms** | 3.87 s |

Command: `/usr/bin/time -p env NODE_ENV=production bun run build`.
Logs: `output/production-cold.log`, `output/production-warm.log`.
The first build also invalidated the content cache following the dependency
change. These times are not a controlled comparison of total-site build speed
against Satori; the controlled renderer comparison is in `COMPARISON.md`.

- `bun test`: **86 passed, 0 failed; 264 assertions in 28 files**.
  PNG regressions cover output dimensions, opacity, both decorative SVG layers,
  concurrent Chinese/English titles, date visibility and renderer dependencies.
- `node tools/astro/check-output.mjs`: passed, including 102 content routes,
  404, static assets, service worker and encrypted-content leakage checks.
- `bun experiments/astro-og-takumi/verify-production.mjs`: all **103** published
  PNGs match the evaluated Takumi output byte-for-byte under the correct
  filenames; URLs, dimensions and all three favicon files are unchanged.
  Total PNG bytes: **7,955,000**. See `production-output.json`.
  This verification uses the pre-migration snapshot and experiment PNGs in
  the local ignored `output/` directory.
- `node experiments/astro-og-takumi/check-dev.mjs`: passed homepage/no-render,
  first request, cache reuse, unknown route, template invalidation/restoration,
  newly added content and draft exclusion checks. The runner preserves the
  existing OG cache and stops its own foreground dev server.
- `bun install --frozen-lockfile --ignore-scripts`: passed.
- Historical baseline and Takumi benchmark smoke runs with `OG_BENCH_LIMIT=1`
  both passed after moving Satori into the isolated experiment dependencies.
- Script syntax checks and `git diff --check`: passed.

`node node_modules/typescript/bin/tsc --noEmit` still fails on existing project
diagnostics, including missing `bun:test` types, the custom OG JSX factory's
missing JSX declarations, component typing and UnoCSS configuration. A
TypeScript compiler-API comparison substitutes the changed source files from
Git HEAD and resolves baseline Satori from the isolated experiment dependency;
all other files and compiler options are held constant. Comparing diagnostic
file/code/message counts while ignoring shifted line numbers found **160
before, 159 after, no introduced diagnostics**. The removed diagnostic was
Satori's font-weight type mismatch. See `typecheck-comparison.json`.

Validation is local. Linux/CI native loading and a complete manual inspection
of all cards have not been performed. The six visual comparisons and the
103-card text-band heuristic are documented in `COMPARISON.md`.
