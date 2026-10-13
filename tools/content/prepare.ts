import { parseDateLikeHugo } from "./time";
import { readSiteConf } from "./site";
import { emitAtom } from "./emit/atom";
import { buildPublicData } from "./emit/publicData";
import { emitPublicAssets } from "./emit/publicAssets";
import { emitSearchIndex } from "./emit/searchIndex";
import { emitSitemaps } from "./emit/sitemap";
import { emitValidPaths } from "./emit/validPaths";
import { reportMarkdownTiming } from "./markdown";
import { fetchCommentsMapping, resolveInkstoneBase } from "./commentsMapping";

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

export const prepareContent = async (data: {posts: any[]; pages: any[]; friends: any[]}, repoRoot: string, publicDir: string) => {
  console.time("content:prepare");
  const site = await readSiteConf(repoRoot);
  const { tokenSecret, hasExplicitSecret } = resolveInkstoneTokenSecret();
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

  console.time("content:normalize");
  const posts = (data.posts as any[]).map(normalizePost);
  const pages = (data.pages as any[]).map(normalizePage);
  console.timeEnd("content:normalize");
  data.posts = posts;
  data.pages = pages;

  const renderablePosts = [...posts]
    .filter((p) => p.draft !== true)
    .sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
  const publishedPosts = renderablePosts.filter((p) => p.isTranslation !== true);
  const renderablePages = [...pages].filter((p) => p.draft !== true);
  let discussionMapping = new Map<string, string>();
  let discussionTotal = 0;
  let loadedDiscussionMapping = false;
  if (!hasExplicitSecret && isLocalPreview()) {
    console.warn(
      formatWarningLog(
        "[content] skip comments-mapping in local preview because INKSTONE_PUBLIC_TOKEN_SECRET is missing.",
      ),
    );
  } else {
    try {
      const mapping = await fetchCommentsMapping({
        tokenSecret,
        baseUrl: resolveInkstoneBase(),
      });
      discussionMapping = mapping.map;
      discussionTotal = mapping.total;
      loadedDiscussionMapping = true;
    } catch (error) {
      if (!isLocalPreview()) throw error;
      const message = error instanceof Error ? error.message : String(error);
      console.warn(
        formatWarningLog(
          `[content] Inkstone API unavailable in local preview. Continue with markdown-only content.\n${message}`,
        ),
      );
    }
  }
  if (loadedDiscussionMapping && discussionTotal !== renderablePosts.length) {
    console.warn(
      formatWarningLog(
        `[content] comments-mapping count (${discussionTotal}) does not match posts (${renderablePosts.length})`,
      ),
    );
  }

  console.time("content:emit:sitemaps");
  await emitSitemaps({
    site,
    publicDir,
    renderablePosts,
    renderablePages,
    publishedPosts,
  });
  console.timeEnd("content:emit:sitemaps");

  console.time("content:emit:atom");
  await emitAtom({
    site,
    publicDir,
    publishedPosts,
    renderablePosts,
  });
  console.timeEnd("content:emit:atom");
  const searchPosts = renderablePosts;
  console.time("content:emit:search-index");
  await emitSearchIndex({ publicDir, posts: searchPosts });
  console.timeEnd("content:emit:search-index");

  console.time("content:strip:raw");
  posts.forEach((post) => {
    delete (post as { rawContent?: unknown }).rawContent;
  });
  console.timeEnd("content:strip:raw");

  console.time("content:emit:public-assets");
  await emitPublicAssets({ site, publicDir });
  console.timeEnd("content:emit:public-assets");
  console.time("content:emit:public-data");
  const result = await buildPublicData({
    posts,
    pages,
    friends: (data as any).friends ?? [],
    tokenSecret,
    discussionMapping,
  });
  console.timeEnd("content:emit:public-data");
  console.time("content:emit:valid-paths");
  await emitValidPaths({
    publicDir,
    renderablePosts,
    renderablePages,
    publishedPosts,
  });
  console.timeEnd("content:emit:valid-paths");
  reportMarkdownTiming();
  console.timeEnd("content:prepare");
  return result;
};

export { formatWarningLog, isLocalPreview, resolveInkstoneTokenSecret };
