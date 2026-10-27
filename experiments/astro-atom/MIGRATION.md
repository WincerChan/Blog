# Astro Atom endpoint migration

Validated on 2026-10-27 against the Atom output from `687d7de`, after the
[sitemap migration](../astro-sitemap/MIGRATION.md), on macOS arm64 / Node v24.12.0.

## Implementation

- `src/astro/pages/atom.xml.ts` prerenders `/atom.xml` in production and
  responds with `application/atom+xml; charset=utf-8` in development.
- The endpoint reads the sanitized Astro Content Layer on each request;
  it does not parse Markdown or fetch the comments mapping again.
- `tools/content/atom.ts` builds Atom 1.0 using `xmlbuilder` 15.1.1, a
  build-time dependency with no transitive dependencies. It replaces manual
  XML string concatenation and escaping while retaining text/HTML types,
  `xml:base`, category schemes/labels and the stylesheet instruction.
- `@astrojs/rss` only emits RSS 2.0. `feed` 6.0.0 was inspected but not used:
  its Atom serializer fixes titles/summaries/content to HTML and cannot set
  the existing `xml:base`. `xmlbuilder2` 4.0.3 was also rejected after a
  probe showed that it preserves entity-looking ampersands inside text;
  embedded HTML needs those ampersands escaped again. Neither is installed.
- Existing feed and entry IDs retain the exact historical hash slicing and
  `/posts/<slug>/index.jsx` hash input. Actual links still use `/posts/<slug>/`.
- Drafts and translations remain excluded. Entries are sorted by publication
  date; feed updates follow the latest original post, with epoch for an empty
  feed. Date-only values retain the existing UTC+08:00 interpretation.
- Encrypted entries use the sanitized `encrypted` flag and expose only the
  original plaintext notice; neither their summary nor their HTML is read
  into the feed. Public posts retain the generated OG cover and full HTML.
- The old emitter and unused XML helpers are removed. `public/atom.xsl`
  already matches the old generated stylesheet, so it is copied as a static
  asset. Its existing CSS generation is unchanged.
- `sax` 1.6.1, already present transitively, is declared directly for strict,
  independent XML parsing in regression tests.

## Verification

- `bun test`: **94 passed**, 326 assertions across 30 files. Atom coverage
  includes fixed historical IDs, date/order/filter behavior, literal text,
  nested HTML entities, category attributes, encrypted sentinels, empty feeds,
  deterministic output, invalid XML characters and malformed dates.
- Two production builds passed. Python ElementTree comparison found the
  entire parsed feed identical to the baseline: **82 entries**, including
  all IDs, links, text, HTML, dates, category attributes and entry order.
  Only XML serialization/formatting differs.
- Both new builds produced byte-identical `atom.xml` files, SHA-256:
  `0f2947c0f9e963574a1066cf1275d666052981a253c874291c8fb47de87f4f27`.
- Sitemap index/URL files, `atom.xsl` and `valid_paths.txt` remain byte-identical
  to the pre-Atom-migration artifacts. Old sitemap paths remain absent.
- `node tools/astro/check-content-watch.mjs` passed against the development
  server: creation, content edits/slug renaming, drafting, republication and
  deletion all update the Atom endpoint. HTTP status and media type were
  checked. The fixture was removed and the server stopped afterward.
- `node tools/astro/check-output.mjs`, frozen-lockfile installation and
  `git diff --check` passed.
- Strict targeted TypeScript checking passed for the new Atom endpoint,
  Atom builder and sitemap production modules using `.astro/types.d.ts`.
  Full-project checking retains the previously recorded unrelated errors;
  it is not claimed to pass.

This change removes duplicated generation responsibilities; it is not a
measured build-speed improvement. The comments API work is unchanged.
No deployment or external feed-reader verification was performed.
