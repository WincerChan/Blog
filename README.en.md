# Wincer's Blog

Personal blog built with Solid 2 + Velite. The default branch (`master`) contains the current Velite-based codebase. The legacy Hugo + SolidStart implementation is preserved in `legacy/hugo-solidstart`.

## Features

- Solid 2 async prerendering with complete static HTML
- Velite content pipeline (`_blogs/content` -> `.velite` -> `public/_data`)
- Multi-language pages and posts
- RSS/Atom, sitemap, and public assets emitted at build time
- Optional encrypted posts (encrypted in build output)
- Service worker update notification

## Tech Stack

- SolidJS / @solidjs/web 2.0.0-rc.9
- @solidjs/router 2.0.0-next.27 + filesystem-routing
- @solidjs/vite-plugin 3.0.0-next.44 (built-in entries and SSR)
- Velite (content pipeline)
- Vite + UnoCSS
- Typesafe i18n

## Project Structure

- `src/routes/` routes (content pages under `src/routes/(pages)`)
- `src/features/pages/` page view components
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
bun install
bun run dev
```

Content build only:

```bash
bun run content:build
```

## Build

```bash
NODE_ENV=production bun run build
```

Requires Node.js 24+ and Bun. The content build explicitly loads the local `.env`; existing process environment variables take precedence.

Vite generates `dist/client` and `dist/server`. Then `tools/build/prerender.mjs` renders `public/valid_paths.txt` plus `/404/` into complete HTML. Once every route succeeds, it writes `.output/public`, including `404.html`. Deploy that directory to Cloudflare Pages or another static host; no Node server or Nitro runtime is needed.

Run `bun run preview` for a local static preview.

## Validation

```bash
bun test
NODE_ENV=production bun run build
bun run test:e2e
```

Browser tests require Google Chrome and start static and development servers on ports 4174 / 5174. They cover hydration, navigation, locales, themes, search, comments, kudos, code copying, and static articles without JavaScript. External APIs use fixtures.

Run `bun run i18n --no-watch` to generate dictionaries. `.typesafe-i18n.json` disables built-in adapter generation to preserve the Solid 2 adapter in `src/i18n/i18n-solid.ts`.

## Optional Build Script

`build.sh` is a convenience script that:

- Installs deps
- Pulls `_blogs` content
- Builds content and site

If your content repo is private, set `GH_TOKEN` for the clone step.

## Environment Variables

- `INKSTONE_PUBLIC_TOKEN_SECRET`: required for the production content build; configure this build-only signing secret in a local `.env` or deployment environment
- `INKSTONE_API_BASE` (optional): shared API base for content generation and the browser; defaults to `http://localhost:8080` in development and `https://inkstone.itswincer.com` in production
- `GH_TOKEN` (optional): used by `build.sh` to clone private content repo
- `CF_PAGES_BUILD_ID` / `CF_PAGES_COMMIT_SHA`: used to hash the service worker version

## Notes

- The content repo is separate from this codebase. Ensure `_blogs/` exists locally.
- `public/_data` is generated content; it should not contain raw passwords.
