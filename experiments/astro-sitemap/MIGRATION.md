# Official Astro sitemap migration

Validated on 2026-10-27 against `687d7de`, on macOS arm64 / Node v24.12.0.

This records the sitemap-only validation stage, before the subsequent
[Atom endpoint migration](../astro-atom/MIGRATION.md).

## Implementation

- `@astrojs/sitemap` 3.7.4 replaces the handwritten XML generator. Astro owns
  route discovery, XML escaping, splitting and index generation.
- Output uses `sitemap-index.xml` and `sitemap-0.xml`; `robots.txt` points to
  the index. The old root and grouped sitemap paths are intentionally removed.
- The content loader writes selected public sitemap metadata to
  `blog-sitemap.json` in Astro's cache directory. The build integration reads
  it through `serialize`; no Markdown is parsed again. This file is not a
  public artifact and contains no article bodies, passwords or comment tokens.
- Content dates, image URLs/captions, priorities, frequencies and the existing
  XSL stylesheet are retained. Category dates follow the latest original
  article; translated copies do not advance them.
- Alternate links require an existing published counterpart. Encrypted article
  bodies are never inspected for image URLs.
- Atom and the comments API pipeline are unchanged. The official sitemap
  integration runs during production builds, not development requests.

## Verification

- `bun test`: **90 tests passed**, 295 assertions in 29 files. New coverage
  exercises official XML output (including image extensions and escaping),
  translation/draft handling, encrypted image exclusion, content dates and
  repeated generation. Loader coverage checks that renamed/drafted articles
  are removed from sitemap metadata.
- Two consecutive `NODE_ENV=production bun run build` executions passed and
  produced byte-identical sitemap index and URL files.
- Parsed old and new XML with Python ElementTree, normalizing equivalent URL
  encoding, the homepage trailing slash and timestamp representations:
  **102 unique page URLs before and after**, all resolving to built HTML;
  all **163 image entries**, modification dates, priorities and frequencies
  match. There are no 404, OG image or metadata-cache entries.
- The old files contained 103 entries because the homepage appeared in both
  the posts and pages files; the official output contains it once.
- Language links decrease from 14 to 12: the old English
  `tlv-encoding-practice` entry advertised a nonexistent `-zh` translation.
  That invalid pair is omitted. All retained alternate targets exist.
- Index references resolve to generated files; index modification dates equal
  their files' latest entry dates. The old sitemap paths are absent.
- Atom and `valid_paths.txt` remain byte-identical to the baseline.
- `node tools/astro/check-output.mjs`, frozen-lockfile installation and
  `git diff --check` pass.
- Strict targeted TypeScript checking of `tools/content/sitemap.ts` and
  `tools/astro/sitemap.ts` passes. Full-project `tsc --noEmit` remains blocked
  by existing diagnostics, including missing `bun:test` declarations; the new
  production modules have no diagnostics.

This validates local build artifacts; no deployment or Google Search Console
submission was performed. No build-time speedup is claimed.
