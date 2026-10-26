# Incremental content and reproducible production assets

Measured locally on **2026-10-26**, comparing baseline commit `4e2e290` with this change on `codex/astro-solid-experiment`. No new dependencies.

## Full-site production timings

Every sample uses `/usr/bin/time -p env NODE_ENV=production bun run build`. Timings include the live read-only Inkstone mapping request, content processing, JS/CSS, HTML, OG files and service worker; dependency installation and content-repository pulls are excluded. Samples were sequential, with no concurrent benchmark builds.

| State | Before: three runs (s) | After: three runs (s) | Median before → after |
| --- | --- | --- | --- |
| Available render caches retained | 7.29, 5.08, 4.95 | 4.20, 3.21, 2.94 | **5.08 → 3.21 (−36.8%)** |
| Content and OG render caches cold | 10.29, 7.62, 7.34 | 7.08, 6.70, 6.70 | **7.62 → 6.70 (−12.1%)** |

Before this change only OG had a persistent cache; its Markdown work was always repeated. New warm builds reuse **94 public article/page renders**, render **1 encrypted article**, skip **22 drafts**, and reuse all **103 OG PNGs**. New cold samples clear both `.cache/content` and `.cache/og` before each run; they render all **95 published entries** and **103 PNGs**. OS, installed dependencies and Astro/Vite caches were not deliberately flushed. These are three-run local observations, not CI guarantees.

The cold baseline was measured in an isolated checkout of `4e2e290`, using a cloned copy of the same installed dependencies and the same content/environment. A node_modules symlink initially failed because Astro misresolved a ClientRouter virtual stylesheet outside its root; that failed run was discarded and dependencies were cloned locally before all three recorded samples. Warm baseline samples were measured in the main checkout before edits. The isolated checkout and its copied environment file were removed afterward.

OG cold medians were **2.826 s before and 2.854 s after**: this round improves the surrounding content pipeline, not PNG rendering. A final unchanged-source confirmation built in **3.20 s**.

## Changes

- Validate frontmatter and filter drafts before rendering. Preserve publication, slug validation, taxonomy and watcher behavior.
- Start the mapping request before Markdown work. Attach rejection handling immediately; production failures still fail the build. No stale API cache or silent fallback was introduced. Keep the five-second deadline active through response-body parsing.
- Persist only public rendered HTML, summary, TOC, word count and search text in `.cache/content`. Keys include source and renderer/configuration inputs; payloads have checksums, schema validation and atomic writes. Invalid/corrupt entries regenerate.
- Keep one entry per source file. Encrypting, drafting or deleting an article removes its old public cached render. Encrypted bodies/passwords never enter this cache; they are processed in memory. Existing public excerpt/TOC behavior is unchanged.
- Reuse the metadata CommonMark tree for search text. Skip private search-body extraction entirely. Keep the distinct rendering and metadata semantics.
- Generate the service-worker version from source inputs instead of time/deployment IDs. Use Wind4's exported theme-dependency set to order declarations deterministically before emission. Keep the same CSS rules/values.
- Derive Atom/category sitemap timestamps from their content, rather than the build clock.
- Fingerprint OG's installed dependency graph, including native optional packages and local patches, rather than the entire root lockfile. Production reuses its initialized renderer snapshot; development retains invalidation checks. Native packages without a main export are resolved via package search directories; this is covered by a regression test.
- Retain caches in `build.sh`. Remove the broken `--hitcache` branch and duplicate 404 copy; unsupported options fail before installation. Keep `dist/public` as the existing deployment-script output contract.

## Validation

- **83 tests / 242 assertions pass.** New coverage includes cross-instance cache reuse, content/config invalidation, corrupt cache recovery, draft/private/delete eviction, early API startup, response-body timeout, deterministic SW/CSS output, renderer dependency traversal and content-derived feed dates.
- Static-output checks pass: 102 content routes + 404, assets, service worker, and encrypted-body/password checks.
- All **103 OG PNGs are byte-identical** to the baseline. Search index is byte-identical.
- All **105 HTML files** (including static verification/404 copies) retain the same visible text as the baseline. CSS is identical after normalizing theme-variable declaration order.
- Two final builds with unchanged inputs have identical filenames and bytes for every output **except the single encrypted article HTML**. Its fresh random salt/IV intentionally changes ciphertext; encryption was not weakened to force reproducibility. See `repeat-output.json`.
- Real development-server checks pass: add/edit/rename/draft/republish/delete routes and search entries; on-demand OG generation, repeated-request reuse, unknown-route 404, template invalidation/restoration, new-content and draft OG routes. Temporary source fixtures were removed and the test server stopped.
- `bash -n build.sh` passes; obsolete `--hitcache` fails before side effects. The content pull, install and npm publication portions were not executed.
- Whole-project `tsc --noEmit` still fails on existing missing `bun:test` declarations and pre-existing component/template types. No new runtime module errors were reported. The added test file has the same missing `bun:test` type issue as existing tests, but executes successfully under Bun.
- `git diff --check` passes. Existing `.env` changes were preserved. No commit or push.

## Cache operations

Normal builds retain both render caches. `clean` removes generated output while retaining them; `clean:content` and `clean:og` clear each cache explicitly; `clean:all` clears output and both caches. CI must restore `.cache/content/` and `.cache/og/` to get reuse across deployments. Neither is a deployment artifact.

Content-cache invalidation intentionally remains conservative for configuration/lockfile changes. OG uses the narrower installed renderer graph. This preserves correctness without requiring a full content-loader dependency graph in this change.
