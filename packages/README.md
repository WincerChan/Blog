# Packages

This folder contains reusable packages published from this repo.

## @wincer/inkstone-track

Framework-agnostic tracker for Inkstone pulse events.

Build the package before running dev if source changes:

```sh
bun run packages:build
```

Token generation:

- The `inkstone_token` must be generated server-side (or at build time) with the shared secret.
- See `docs/api_private.md` → "Public token format".
- Implementation reference: `tools/velite/inkstoneToken.ts`.

Publish steps (from repo root):

```sh
cd packages/inkstone-track
bun run build
bun run build:types
bun publish --access public

cd ../icons
bun publish --access public
```

## @wincer/icons

Shared SVG/PNG assets for CDN usage.
