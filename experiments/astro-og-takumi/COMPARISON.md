# Takumi native OG rendering experiment

Measured on 2026-10-26, on `codex/astro-solid-experiment` at `0d3b92b`.
Node v24.12.0, macOS arm64, Apple M3; 8 concurrent cards and the default native
thread-pool settings. Takumi is pinned to **2.18.1** in an isolated package.
At the time of this comparison, production source, dependencies, lockfile and
`.cache/og` were unchanged. The subsequently authorized production migration is
recorded separately in `MIGRATION.md`.

## Result

The same 103 production targets, seven font buffers, JSX template and
**1800 × 945** PNG output were used for every renderer. Three fresh Node
processes per renderer ran sequentially, alternating renderer order. PNG saving
and image comparison were outside the timed section. No existing PNG cache was
read; renderer-internal caches and the production shared background are enabled.

| Renderer | Three batch runs (s) | Batch median (s) | Initialization + batch median (s) | Total PNG bytes |
| --- | --- | --- | --- | --- |
| Current Satori + resvg + Sharp level 6 | 2.535, 2.482, 2.439 | **2.482** | **2.542** | 11,038,604 |
| Takumi native PNG | 0.929, 0.901, 0.906 | **0.906** | **0.993** | 7,955,000 |
| Takumi raw RGBA + Sharp level 6 | 0.940, 0.943, 0.936 | **0.940** | **1.042** | 10,378,161 |

- Batch rendering is **63.5% shorter / 2.74× faster**, saving 1.576 s.
- Including initialization, the isolated renderer work is **60.9% shorter**,
  saving 1.549 s. Use this comparison when evaluating a cold renderer: Takumi
  explicitly registers fonts before the batch timer, whereas Satori first
  parses fonts during the batch.
- Native Takumi PNGs total **27.9% fewer bytes**. The raw-RGBA control confirms
  that the speed improvement remains when both engines use Sharp level 6.
- Process peak RSS medians: baseline 918.5 MiB, Takumi 389.1 MiB,
  Takumi + Sharp 485.2 MiB. These include the harness and retained PNG buffers;
  they are not measurements of a complete Astro build.

`initializationMs` includes renderer imports, compiling the temporary template
module and explicit renderer/font initialization. Common content-store reading,
target construction, font-file reading and Vite startup precede it. The batch
timer includes per-card JSX construction, conversion/layout, rasterization,
encoding and first-render internal initialization. `processMs` is diagnostic
only: first trials also save images after rendering, so do not compare it as a
uniform rendering metric.

Raw measurements are in `measurements.json`. Input, content-store and font
SHA-256 digests match across all nine processes. PNG hashes within each renderer
are identical across its three runs. This is a local stage benchmark, **not a
full Astro production build or CI benchmark**; no complete-build speedup is claimed.

## Template adaptation

The harness compiles the production TSX using the project's Vite/Oxc transform.
For Takumi it extracts the existing JSX root instead of calling Satori, then uses
`fromJsx` and one reused native `Renderer`. No design elements, text or font
buffers are removed. Native binding loading is checked from the loaded `.node`
module; no WASM backend is used.

Two adaptations were necessary:

1. The JSX helper converts SVG width/height attributes using `Number()`, so the
   two `width="100%" height="100%"` decorations lose their dimensions. The first
   unadapted sample omitted both backgrounds. Their known full-canvas dimensions
   are set to 1200 × 630 in the experiment before conversion. The original
   sample is retained under the ignored `output/original` directory at 1× scale.
2. The installed native renderer applies `devicePixelRatio` to drawing, while
   explicit `width`/`height` remain output pixels. A minimal 100 px red square
   became 150 px at DPR 1.5, but an explicit 1200 × 630 output stayed that size.
   The experiment sets output dimensions to 1800 × 945 and the logical root to
   1200 × 630, with DPR 1.5. There is no bitmap upscaling or reduced resolution.

An initial diagnostic also found that the typed `__napiBindingTarget` export is
not exported by the public wrapper in this release; the harness now verifies
the actually loaded native module. Failed smoke checks and the 1× samples are
excluded from the reported timings. These findings are scoped to the installed
2.18.1 package on this platform, rather than claims about every Takumi version.

## Image checks

- All three engines produce 103 PNGs with the same target manifest and dimensions.
- All 103 Takumi-native PNGs decode to **exactly the same RGBA bytes** as the
  Takumi-raw + Sharp control, confirming the native encoder's lossless output
  for these images.
- Satori and Takumi are **not pixel-identical**: glyph edges/spacing, minor text
  positioning and decorative rendering differ. Median mean absolute RGB error
  across the entire canvas is 1.048/255; maximum is 2.126/255. These metrics are
  diagnostic, not a visual acceptance threshold.
- The dark-text horizontal-band heuristic found no line-count differences
  across the 103 cards. It cannot prove exact line breaks, glyph completeness or
  absence of every possible overflow.
- Visually inspected six pairs: Chinese/mixed text, the longest English title,
  the largest pixel-difference card, home and category. No missing glyphs or
  additional line wrapping were observed in those samples. The already tight
  three-line English title remains tight in both renderers.
- `comparison.png` displays baseline on the left and Takumi on the right;
  per-image metrics are in `comparison.json`. Full-resolution PNGs and manifests
  are in the ignored `output/` directory.

The production OG regression suite passes **15 tests / 36 assertions**; script
syntax checks and `git diff --check` also pass. At this stage, the production renderer had not been switched; Linux/CI, a full
Astro build using Takumi, and a complete manual review of every card remain untested.

## Reproduce

From the repository root, after a production content sync has populated
`.astro/data-store.json`. The harness reads the original template and resvg code
from Git revision `0d3b92b` so this comparison remains reproducible after migration;
Satori is pinned in this experiment's own dependencies:

```sh
bun install --cwd experiments/astro-og-takumi --frozen-lockfile --ignore-scripts
node experiments/astro-og-takumi/run.mjs
node experiments/astro-og-takumi/compare.mjs
bun test scripts/og-render.test.ts scripts/og-image.test.ts scripts/og-cache.test.ts scripts/og-resvg-fonts.test.ts
```

For one renderer:

```sh
node experiments/astro-og-takumi/benchmark.mjs baseline
node experiments/astro-og-takumi/benchmark.mjs takumi
node experiments/astro-og-takumi/benchmark.mjs takumi-sharp
```

`OG_BENCH_LIMIT`, `OG_BENCH_SCALE`, `OG_BENCH_OUTPUT`, `OG_BENCH_REPORT` and
`OG_RENDER_CONCURRENCY` are optional probe controls. `run.mjs` resets the first
three and fixes concurrency at 8 for the comparison. Use the current content
store and compare its recorded digests rather than assuming future runs use the
same articles.

At the experiment stage, Takumi was isolated from the site's dependencies. The
later production migration uses `@takumi-rs/core` and `@takumi-rs/helpers`
directly. This experiment keeps `takumi-js` and Satori pinned in its own Bun
lockfile; `takumi-js` also installs a WASM distribution that the benchmark does
not load.

Reference: [Takumi documentation](https://takumi.kane.tw/docs/),
[migration guide](https://takumi.kane.tw/docs/comparison-to-satori/).
