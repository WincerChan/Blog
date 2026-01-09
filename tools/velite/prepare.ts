import path from "node:path";
import type { VeliteConfig } from "velite";
import { parseDateLikeHugo } from "./time";
import { readSiteConf } from "./site";
import { emitAtom } from "./emit/atom";
import { emitPublicData } from "./emit/publicData";
import { emitPublicAssets } from "./emit/publicAssets";
import { emitSearchIndex } from "./emit/searchIndex";
import { emitSitemaps } from "./emit/sitemap";
import { emitValidPaths } from "./emit/validPaths";
import { reportMarkdownTiming } from "./markdown";

const normalizeDates = (value: { date?: string; updated?: string }) => {
  const dateObj = parseDateLikeHugo(value.date);
  const updatedObj = parseDateLikeHugo(value.updated ?? value.date);
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

export const prepareVelite: VeliteConfig["prepare"] = async (data, context) => {
  console.time("velite:prepare");
  const repoRoot = path.dirname(context.config.configPath);
  const site = await readSiteConf(repoRoot);
  const publicDir = path.join(repoRoot, "public");

  console.time("velite:normalize");
  const posts = (data.posts as any[]).map(normalizePost);
  const pages = (data.pages as any[]).map(normalizePage);
  console.timeEnd("velite:normalize");

  data.posts = posts;
  data.pages = pages;

  const renderablePosts = [...posts]
    .filter((p) => p.draft !== true)
    .sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
  const publishedPosts = renderablePosts.filter((p) => p.isTranslation !== true);
  const renderablePages = [...pages].filter((p) => p.draft !== true);

  console.time("velite:emit:sitemaps");
  await emitSitemaps({
    site,
    publicDir,
    renderablePosts,
    renderablePages,
    publishedPosts,
  });
  console.timeEnd("velite:emit:sitemaps");

  console.time("velite:emit:atom");
  await emitAtom({
    site,
    publicDir,
    publishedPosts,
    renderablePosts,
  });
  console.timeEnd("velite:emit:atom");
  const searchPosts = renderablePosts;
  console.time("velite:emit:search-index");
  await emitSearchIndex({ publicDir, posts: searchPosts });
  console.timeEnd("velite:emit:search-index");

  console.time("velite:strip:raw");
  posts.forEach((post) => {
    delete (post as { rawContent?: unknown }).rawContent;
  });
  console.timeEnd("velite:strip:raw");

  console.time("velite:emit:public-assets");
  await emitPublicAssets({ site, publicDir });
  console.timeEnd("velite:emit:public-assets");
  console.time("velite:emit:public-data");
  await emitPublicData({
    publicDir,
    posts,
    pages,
    friends: (data as any).friends ?? [],
  });
  console.timeEnd("velite:emit:public-data");
  console.time("velite:emit:valid-paths");
  await emitValidPaths({
    publicDir,
    renderablePosts,
    renderablePages,
    publishedPosts,
  });
  console.timeEnd("velite:emit:valid-paths");
  reportMarkdownTiming();
  console.timeEnd("velite:prepare");
};
