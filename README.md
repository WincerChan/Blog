# Wincer's Blog

Personal blog built with SolidStart + Velite. The codebase was migrated from a Hugo-era setup and reorganized around a content-first pipeline to keep build/runtime responsibilities clean.

## Features

- SolidStart app with static preset output
- Velite content pipeline (`_blogs/content` -> `.velite` -> `public/_data`)
- Multi-language pages and posts
- RSS/Atom, sitemap, and public assets emitted at build time
- Optional encrypted posts (content is encrypted in build output)
- Service worker update notification

## Tech Stack

- SolidStart + SolidJS
- Velite (content pipeline)
- Vite + UnoCSS
- Typesafe i18n

## Project Structure

- `src/routes/` routes (content pages under `src/routes/(pages)`)
- `src/pages/` page view components
- `src/layouts/` layout shells
- `src/features/` cross-cutting features (e.g. `features/theme`)
- `tools/velite/` content pipeline utilities
- `_blogs/content/` markdown source (external content repo)
- `public/_data/` generated runtime JSON data

## Content Workflow

1. Write content in `_blogs/content/posts` and `_blogs/content/pages`.
2. Velite parses markdown and emits `.velite/*.json`.
3. Build step generates runtime JSON into `public/_data`.
4. The app reads data from `public/_data` at runtime.

### Encrypted Posts

If a post has `encrypt_pwd` in its front matter, the build will:

- Encrypt the HTML and store it in `public/_data/posts/*.json` under `html`.
- Remove the original `encrypt_pwd` from the output.
- Add `encrypted: true` so the UI can prompt for a password.

## Development

```bash
pnpm install
pnpm dev
```

Content build only:

```bash
pnpm content:build
```

## Build

```bash
pnpm build
```

Output is generated in `.output/public` (static preset). This repo is intended to be deployed to Cloudflare Pages.

## Optional Build Script

`build.sh` is a convenience script that:

- Installs deps
- Pulls `_blogs` content
- Builds content and site

If your content repo is private, set `GH_TOKEN` for the clone step.

## Environment Variables

- `GH_TOKEN` (optional): used by `build.sh` to clone private content repo
- `CF_PAGES_BUILD_ID` / `CF_PAGES_COMMIT_SHA`: used to hash the service worker version

## Notes

- The content repo is separate from this codebase. Ensure `_blogs/` exists locally.
- `public/_data` is generated content; it should not contain raw passwords.
