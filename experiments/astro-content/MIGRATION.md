> OG generation has since moved out of the content loader into a cached static endpoint. See [OG comparison](../astro-og/COMPARISON.md) for the current behavior and measurements. The results below describe the preceding content migration.

# Astro Content Layer migration

Branch: `codex/astro-solid-experiment`. Validation: 2026-10-13.

## Implementation

- Removed Velite, `velite.config.ts`, `content:build`, the prebuild hook, the JSON reader and the Velite/Vite watcher bridge.
- `src/astro/content.config.ts` defines a typed `blog` collection. Its loader owns posts, pages and derived site metadata together, so relationships, taxonomy and publication filtering share one content revision.
- `tools/content` retains the original normalization, Shiki/KaTeX, search, Atom/Hugo IDs, sitemap, OG and AES-GCM logic. Markdown rendering uses the official `@astrojs/markdown-remark` processor through `LoaderContext.renderMarkdown`.
- Content Layer entries contain sanitized article/page data. Raw source, passwords and unencrypted private article HTML remain in process memory. The browser receives the existing encrypted payload format.
- Assets are emitted directly into `.astro-public`; Astro copies them into `dist/astro`. Pages consume `astro:content`, without per-article intermediate JSON or SPA payloads. Legacy generated files in `public` are excluded from copying.
- Development caches parsed/rendered source in memory, serializes updates, and refreshes derived outputs on additions, edits, slug changes, draft changes and deletions. A new production process renders content again; no persistent raw-content cache is claimed.
- The OG JSX template has a separate classic-JSX transform because its elements belong to Satori, not Solid.

## Dependencies

`@astrojs/markdown-remark` supplies the official Unified processor. `mdast-util-toc`, `mdast-util-to-hast`, `hast-util-raw` and `hast-util-to-string` are now direct dependencies: they reproduce metadata semantics previously supplied inside Velite. All run during content generation, not in browser islands.

## Validation

- Clean build after removing `.velite`, `.astro` and `node_modules/.astro` caches: 9.74 seconds wall-clock (single run, not a benchmark).
- Production build: 103 pages (85 posts, 10 source pages, generated routes and 404).
- 72 tests, 178 assertions passed, including metadata normalization, summary/word/TOC behavior, encrypted payload round-trip and draft/deletion filtering.
- Compared against a production build from immediately before the content migration. Public article/page HTML, TOC, summaries and word counts match. Decrypting the new private article payload produces the same HTML as before.
- Search index, valid paths and all 103 OG PNGs are byte-identical. Atom and sitemap entries are unchanged; build timestamps differ and equal-date page sitemap entries now follow deterministic source-file order.
- The 19 emitted client JS files retain identical total size (115,474 uncompressed bytes); 18 are byte-identical, and FooterControls differs only in the generated service-worker build timestamp. This migration does not aim to reduce client JS.
- 16 browser comparisons (8 routes at desktop/mobile widths): matching text, title and footer geometry, no overflow or JavaScript errors. CSS hash/order changed without changing those layouts.
- 10 browser checks passed for comments, password states in both themes/viewports, navigation, theme, ToC and mocked likes. API writes were mocked; no real comments or likes were submitted.
- Watch validation passed: new article, edit/slug rename, draft removal from routes/search/taxonomy, republish, delete. Fixture removed afterwards.
- Output checks verify all routes/assets, absence of SPA JSON, and encrypted article output. Published HTML/JS/JSON/XML were checked for the private article's password and plaintext.
- Full `tsc --noEmit` remains failing on existing project issues (including missing `bun:test` types and component/OG template typing). The loader, collection schemas, metadata module, content accessor and stats have no reported errors. See `typecheck.log`; this is not a claim that the project typecheck passes.

Useful commands:

```sh
NODE_ENV=production bun run build
bun test
node tools/astro/check-output.mjs
# With a dev server already running:
ASTRO_TEST_URL=http://localhost:3001 node tools/astro/check-content-watch.mjs
```
