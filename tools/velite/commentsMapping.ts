import { buildInkstoneToken } from "./inkstoneToken";

const COMMENTS_MAPPING_PATH = "/v2/comments/mapping";
const DEFAULT_TIMEOUT_MS = 5000;

type FetchCommentsMappingOptions = {
  tokenSecret: string;
  baseUrl: string;
  timeoutMs?: number;
};

type RawMappingItem = {
  post_id?: unknown;
  discussion_url?: unknown;
};

const normalizeCommentPath = (input: string) => {
  let pathname = String(input ?? "").trim();
  if (!pathname) return "";
  if (/^https?:\/\//.test(pathname)) {
    try {
      pathname = new URL(pathname).pathname;
    } catch {
      return "";
    }
  }
  pathname = pathname.split("?")[0].split("#")[0];
  if (!pathname.startsWith("/")) pathname = `/${pathname}`;
  if (!pathname.endsWith("/")) pathname = `${pathname}/`;
  return pathname.toLowerCase();
};

const buildCommentsMapping = (items: unknown) => {
  const map = new Map<string, string>();
  if (!Array.isArray(items)) return map;
  for (const raw of items) {
    const item = raw as RawMappingItem;
    const postId = normalizeCommentPath(String(item?.post_id ?? ""));
    const url = String(item?.discussion_url ?? "").trim();
    if (!postId || !url) continue;
    map.set(postId, url);
  }
  return map;
};

const fetchCommentsMapping = async ({
  tokenSecret,
  baseUrl,
  timeoutMs = DEFAULT_TIMEOUT_MS,
}: FetchCommentsMappingOptions) => {
  if (!tokenSecret) {
    throw new Error("[velite] Missing INKSTONE_PUBLIC_TOKEN_SECRET");
  }
  const token = buildInkstoneToken(COMMENTS_MAPPING_PATH, tokenSecret);
  const url = new URL(COMMENTS_MAPPING_PATH, baseUrl);
  url.searchParams.set("inkstone_token", token);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let response: Response;
  try {
    response = await fetch(url, { signal: controller.signal });
  } catch (error) {
    throw new Error(`[velite] comments-mapping fetch failed: ${String(error)}`);
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    throw new Error(
      `[velite] comments-mapping fetch failed: ${response.status} ${response.statusText}`,
    );
  }

  let payload: any = null;
  try {
    payload = await response.json();
  } catch (error) {
    throw new Error(`[velite] comments-mapping parse failed: ${String(error)}`);
  }

  const map = buildCommentsMapping(payload?.items ?? []);
  return {
    map,
    total: map.size,
    reportedTotal: Number.isFinite(payload?.total) ? Number(payload.total) : undefined,
  };
};

const resolveInkstoneBase = () => {
  const env = String(process.env.NODE_ENV ?? "").toLowerCase();
  if (env === "development") return "http://localhost:8080";
  return "https://inkstone.itswincer.com";
};

export {
  COMMENTS_MAPPING_PATH,
  buildCommentsMapping,
  fetchCommentsMapping,
  normalizeCommentPath,
  resolveInkstoneBase,
};
