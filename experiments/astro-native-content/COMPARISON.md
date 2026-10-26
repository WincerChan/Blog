# Reuse Astro's content rendering pipeline

Compared with `010c650` on `codex/astro-solid-experiment`, 2026-10-26.

## Implementation

- Use Astro's public `parseFrontmatter`, preserving date normalization and BOM handling. Replace `matterLoader.ts` with `frontmatter.ts`.
- Use `renderMarkdown().metadata.headings` for nested ToC markup. Astro supplies heading IDs; the blog only handles nesting, escaping and its depth limit, excluding generated footnote navigation.
- Use Astro's configured Shiki highlighter and shared Shiki 4.5.0. Remove the separate Shiki 3 pipeline, filesystem language scan, highlighter prewarming and redundant language-attribute pass. Retain the semantic theme and blog code-block UI.
- Extract summaries/search text in a remark plugin and count words in a rehype plugin during the same render. Remove the second CommonMark parse and Markdown-to-HAST conversion. Short title/subtitle fields use a lightweight Astro processor; articles use their already collected search text.
- Keep the custom loader for publication ordering, draft filtering, encrypted content and cache controls. Private source/password/unencrypted body remain memory-only; only sanitized content reaches the Astro store.

## Dependencies

Remove direct declarations for `@shikijs/rehype`, `gray-matter`, `mdast-util-to-hast`, `mdast-util-toc`, `rehype-slug`, `remark-parse`, `shiki`, `unified` and redundant `@unocss/preset-typography`. Some remain legitimate transitive Astro/UnoCSS dependencies.

Replace `hast-util-to-string` with `hast-util-to-text` for word extraction: text from adjacent table cells/rows needs word boundaries, and footnote controls must not count as article text. `hast-util-to-text` already exists in Astro's dependency graph; no new resolved package is introduced by this declaration. Keep `hast-util-raw` to parse inline HTML before blog table/image enhancements and word extraction.

Net reduction: **9 direct dependency declarations**. Lockfile resolution entries: **867 → 842** (these include nested resolutions, not a disk-size measurement). Shiki has one resolved version, **4.5.0**, instead of 3.x and 4.x.

## Output comparison

Raw public-content comparison: [comparison.json](./comparison.json).

- **94/94 public articles/pages** retain the same whitespace-normalized body text, heading IDs and code-block language labels.
- 3 summaries lose leftover GFM strikethrough syntax.
- 32 search texts change due to GFM normalization (tables, strikethrough, autolinks and footnotes).
- 3 article word counts change because footnotes now count their rendered content instead of raw reference/definition syntax: 1555 → 1552, 2569 → 2537, 3270 → 3264.
- One ToC now includes two headings omitted by the old `mdast-util-toc` extraction. Three other ToC strings differ only through correct HTML escaping, with unchanged visible labels.
- The user explicitly chose metadata consistent with rendered content rather than preserving the old CommonMark quirks.
- Browser comparisons cover home, formula article and travel article at 1440px/375px: unchanged code text/languages/dimensions, no horizontal page overflow, no unresolved ToC links. The sampled Python code-block screenshots are pixel-identical.
- Client assets remain **19 JS files / 115,287 uncompressed bytes** in both builds. This is a build-pipeline/dependency simplification, not a browser JS reduction; no new network-transfer benchmark was run.

## Validation

- `NODE_ENV=production bun run build`: 103 pages.
- `node tools/astro/check-output.mjs`: 102 content routes + 404, assets, SW and encrypted-content checks.
- `bun test`: **84 tests / 253 assertions**, including real Astro-renderer regression tests for metadata, heading IDs, GFM tables/footnotes/math, language fallback, and private/draft cache handling.
- `tools/astro/browser-check.mjs`: 10 checks (comments, password controls, navigation, themes, ToC, mocked likes).
- `tools/astro/full-browser-check.mjs`: 5 checks (search/history, mobile navigation, English metadata, offline reload, SW updates).
- `tools/astro/check-content-watch.mjs`: add/edit/rename/draft/republish/delete lifecycle passes; fixture removed.
- `bunx tsc --noEmit`: still fails on existing missing `bun:test` types and unrelated component/template type errors. No diagnostics in changed content runtime modules. This is not a passing whole-project typecheck.

Initial verification exposed tests still calling deleted helpers and a word-boundary issue between table header/body groups; tests now exercise Astro's actual renderer and table boundaries are preserved during counting. The first dev-watcher attempt hit the wrong port because the new Astro CLI auto-backgrounded under the agent and duplicate `--port` flags were passed; rerunning the CLI with one port and `--ignore-lock` succeeded. Temporary servers were stopped; no production API writes or deployment were performed.
