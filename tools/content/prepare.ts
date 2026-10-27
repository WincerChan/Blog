import { performance } from "node:perf_hooks";
import { parseDateLikeHugo } from "./time";
import { readSiteConf } from "./site";
import { buildPublicData } from "./emit/publicData";
import { emitPublicAssets } from "./emit/publicAssets";
import { emitSearchIndex } from "./emit/searchIndex";
import { emitValidPaths } from "./emit/validPaths";
import { reportMarkdownTiming } from "./markdown";
import { fetchCommentsMapping, resolveInkstoneBase } from "./commentsMapping";
import { createContentTimer, isContentDebug } from "./timing";

const assertValidDate = (label: string, value: string | undefined, slug: string) => {
  const parsed = parseDateLikeHugo(value);
  if (!Number.isFinite(parsed.getTime())) {
    const raw = value ?? "";
    throw new Error(`[content] Invalid ${label} for "${slug}": "${raw}"`);
  }
  return parsed;
};

const normalizeDates = (value: { date?: string; updated?: string; slug?: string }) => {
  const slug = String(value.slug ?? "unknown");
  const dateObj = assertValidDate("date", value.date, slug);
  const updatedObj = assertValidDate("updated", value.updated, slug);
  return { dateObj, updatedObj };
};

const normalizePost = (post: any) => {
  const { dateObj, updatedObj } = normalizeDates(post);
  return {
    ...post,
    tags: Array.isArray(post.tags) ? post.tags.map((x: unknown) => String(x)).filter(Boolean) : [],
    dateObj,
    updatedObj,
    url: `/posts/${String(post.slug)}/`,
  };
};

const normalizePage = (page: any) => {
  const { dateObj, updatedObj } = normalizeDates(page);
  return {
    ...page,
    dateObj,
    updatedObj,
    url: `/${String(page.slug)}/`,
  };
};

const isLocalPreview = (env = process.env) =>
  String(env.NODE_ENV ?? "").toLowerCase() === "development";

const LOCAL_PREVIEW_TOKEN_SECRET = "__local_preview__";
const WARN_BADGE = "\x1b[30;43m WARN \x1b[0m";

const formatWarningLog = (message: string) => `${WARN_BADGE} \x1b[1;33m${message}\x1b[0m`;

const resolveInkstoneTokenSecret = (env = process.env) => {
  const explicit = String(env.INKSTONE_PUBLIC_TOKEN_SECRET ?? "").trim();
  if (explicit) {
    return {
      tokenSecret: explicit,
      hasExplicitSecret: true,
    };
  }
  if (isLocalPreview(env)) {
    return {
      tokenSecret: LOCAL_PREVIEW_TOKEN_SECRET,
      hasExplicitSecret: false,
    };
  }
  return {
    tokenSecret: "",
    hasExplicitSecret: false,
  };
};

// Attach both handlers immediately: rendering may fail or outlast an API error.
export function beginContentPreparation() {
  const auth = resolveInkstoneTokenSecret();
  if (!auth.tokenSecret) throw new Error("[content] Missing INKSTONE_PUBLIC_TOKEN_SECRET");
  const mapping = !auth.hasExplicitSecret && isLocalPreview()
    ? Promise.resolve({ value: undefined })
    : fetchCommentsMapping({ tokenSecret: auth.tokenSecret, baseUrl: resolveInkstoneBase() })
      .then(value => ({ value }), error => ({ error }));
  return { ...auth, mapping };
}

export const prepareContent = async (data: {posts: any[]; pages: any[]; friends: any[]}, repoRoot: string, publicDir: string, preparation = beginContentPreparation()) => {
  const started = performance.now();
  const timing = createContentTimer();
  const site = await readSiteConf(repoRoot);
  const { tokenSecret, hasExplicitSecret } = preparation;
  if (!tokenSecret) {
    throw new Error("[content] Missing INKSTONE_PUBLIC_TOKEN_SECRET");
  }
  if (!hasExplicitSecret && isLocalPreview()) {
    console.warn(
      formatWarningLog(
        "[content] Missing INKSTONE_PUBLIC_TOKEN_SECRET in local preview. Inkstone data is disabled; continuing with markdown-only content.",
      ),
    );
  }

  timing.start("content:normalize");
  const posts = (data.posts as any[]).map(normalizePost);
  const pages = (data.pages as any[]).map(normalizePage);
  timing.end("content:normalize");
  data.posts = posts;
  data.pages = pages;

  const renderablePosts = [...posts]
    .filter((p) => p.draft !== true)
    .sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
  const publishedPosts = renderablePosts.filter((p) => p.isTranslation !== true);
  const renderablePages = [...pages].filter((p) => p.draft !== true);
  let discussionMapping = new Map<string, string>();
  let commentsWaitMs = 0;
  if (!hasExplicitSecret && isLocalPreview()) {
    console.warn(
      formatWarningLog(
        "[content] skip comments-mapping in local preview because INKSTONE_PUBLIC_TOKEN_SECRET is missing.",
      ),
    );
  } else {
    // The request started before Markdown rendering; measure only the remaining wait.
    const waitStarted = performance.now();
    try {
      const outcome = await preparation.mapping;
      if ('error' in outcome) throw outcome.error;
      const mapping = outcome.value;
      if (!mapping) throw new Error('[content] Missing comments mapping result');
      discussionMapping = mapping.map;
    } catch (error) {
      if (!isLocalPreview()) throw error;
      const message = error instanceof Error ? error.message : String(error);
      console.warn(
        formatWarningLog(
          `[content] Inkstone API unavailable in local preview. Continue with markdown-only content.\n${message}`,
        ),
      );
    } finally {
      commentsWaitMs = performance.now() - waitStarted;
    }
  }

  const searchPosts = renderablePosts;
  timing.start("content:emit:search-index");
  await emitSearchIndex({ publicDir, posts: searchPosts });
  timing.end("content:emit:search-index");

  timing.start("content:strip:raw");
  posts.forEach((post) => {
    delete (post as { rawContent?: unknown }).rawContent;
  });
  timing.end("content:strip:raw");

  timing.start("content:emit:public-assets");
  await emitPublicAssets({ site, publicDir });
  timing.end("content:emit:public-assets");
  timing.start("content:emit:public-data");
  const result = await buildPublicData({
    posts,
    pages,
    friends: (data as any).friends ?? [],
    tokenSecret,
    discussionMapping,
  });
  timing.end("content:emit:public-data");
  timing.start("content:emit:valid-paths");
  await emitValidPaths({
    publicDir,
    renderablePosts,
    renderablePages,
    publishedPosts,
  });
  timing.end("content:emit:valid-paths");
  reportMarkdownTiming();
  if (isContentDebug()) {
    console.log(`content:prepare: ${(performance.now() - started).toFixed(1)}ms (comments HTTP wait: ${commentsWaitMs.toFixed(1)}ms)`);
  }
  return result;
};

export { formatWarningLog, isLocalPreview, resolveInkstoneTokenSecret };
