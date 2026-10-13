# Cached Astro OG endpoints

Follow-up: [cold-render optimization](../astro-og-cold/COMPARISON.md) replaces synchronous PNG encoding with Sharp. The measurements below describe the earlier cache-only implementation.

Measured on 2026-10-13, locally on the same machine and content. Branch: `codex/astro-solid-experiment`. No renderer replacement or new dependencies.

## Results

All full builds use `NODE_ENV=production bun run build`, timed externally with `/usr/bin/time -p`. Dependency installation is excluded; content processing, the read-only Inkstone mapping request, site rendering, PNG output and service-worker build are included. Runs are sequential. Cold below means an empty **OG cache**, not cleared OS/dependency/Astro caches.

| Implementation / cache | Wall-clock runs (s) | Median (s) | PNGs rendered |
| --- | --- | --- | --- |
| Previous loader-based generation | 10.00, 9.29, 9.17 | 9.29 | 103 every run |
| Endpoint, empty OG cache | 10.06, 9.16, 9.61 | 9.61 | 103 |
| Endpoint, retained OG cache | 5.27, 4.77, 5.14 | 5.14 | 0 |

Cached builds reduced median wall time by **44.7% (4.15 s)**. Cold builds did not improve; the measured median was 0.32 s higher, with overlapping run ranges. This is a three-run local comparison, not a CI performance guarantee.

OG generation previously took a median 4.061 s. New cold preparation took 4.304–4.390 s; cached preparation took 20–21 ms. Preparation metrics exclude the subsequent endpoint response/file-writing phase, which is included in the full-build timings above.

Additional real-source experiments, one run each:

| Change | Full build (s) | Cached / rendered | Output |
| --- | --- | --- | --- |
| Append body text without changing the displayed summary | 5.84 | 103 / 0 | All PNGs identical |
| Change one article title | 5.70 | 102 / 1 | Exactly that article PNG changed |
| Restore the original source | 5.28 | 103 / 0 | All PNGs match baseline again |

Content was restored byte-for-byte. Individual wall times also include content processing and network variation; the image counts directly verify selective regeneration.

## Implementation

- `src/astro/pages/og/[image].png.ts` owns the existing `/og/*.png` URLs. Production uses `getStaticPaths` and `GET` to emit static PNGs. Development generates only requested images.
- The content loader no longer imports or invokes OG rendering. Target selection and display normalization live in `tools/content/og/targets.ts`.
- Production prepares this endpoint's images with the existing bounded concurrency, then serves the cached bytes through each static endpoint. HTML route concurrency is unchanged.
- `.cache/og/` stores complete PNGs keyed by displayed title/subtitle/date/site/font choices, template sources, font bytes, renderer packages, lockfile, scale and platform. Lockfile invalidation is intentionally conservative and also covers transitive renderer changes.
- Cache hits skip Satori/resvg initialization. Concurrent requests for one key share the render. Cache writes use temporary files and rename; SHA-256 sidecars detect incomplete/corrupt restored entries and cause regeneration.
- Vite `?raw` dependencies fingerprint the template code from the same module lifecycle used to render. The first implementation read template source directly from disk; testing caught an HMR race that could cache an old render under a new source hash. That approach was replaced and the regression check now changes the actual accent color, verifies different output, then restores the template and verifies the original image.
- The existing Satori/resvg background composition remains unchanged. Image format, dimensions (1800 × 945), layout and URLs remain unchanged.
- `bun run clean` preserves OG cache. `bun run clean:og` clears it. CI must retain/restore `.cache/og/` for reuse across deployments. Only current routes are published; old cache files do not become deployed images.

## Verification

- 103 baseline PNGs are byte-identical after migration and restoration; output contains exactly those 103 PNGs.
- 103 HTML pages and required assets pass the existing output checker.
- 75 tests / 193 assertions pass, including persistent reuse, concurrent coalescing, content/version invalidation, corruption recovery, retry after render failure and displayed-field normalization.
- Development checks pass: startup/homepage generates zero images; first OG request generates one; the second reuses it; unknown route returns 404; template changes invalidate correctly; restored template reuses the original; newly added content gets an OG route; drafting it removes that route. All fixtures removed.
- Whole-project typecheck still reports pre-existing project problems, including missing `bun:test` types and OG template/component types. No errors are reported in the new endpoint, renderer, target normalization or cache modules. See `typecheck.log`.

Repeat development checks after clearing OG cache and starting a dev server:

```sh
bun run clean:og
ASTRO_TEST_URL=http://localhost:3001 node tools/astro/check-og-dev.mjs
```

Build timing logs and machine-readable measurements are stored alongside this report. No commit or push was performed.
