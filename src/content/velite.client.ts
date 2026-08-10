/**
 * Client-build replacement for `velite.server.ts`.
 *
 * `velite.ts` selects the browser fetch implementation when `import.meta.env.SSR`
 * is false. This fallback only keeps the server-only module out of the client
 * dependency graph; it is never called by the browser implementation.
 */
const readPublicJsonSync = <T>(_urlPath: string, fallback: T): T => fallback;

export { readPublicJsonSync };
