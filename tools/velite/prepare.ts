import path from "node:path";
import type { VeliteConfig } from "velite";
import { parseDateLikeHugo } from "./time";
import { readSiteConf } from "./site";
import { emitAtom } from "./emit/atom";
import {
  collectLegacyCommentPaths,
  emitLegacyComments,
  loadLegacyCommentsMap,
} from "./emit/legacyComments";
import { emitPublicData } from "./emit/publicData";
import { emitPublicAssets } from "./emit/publicAssets";
import { emitSitemaps } from "./emit/sitemap";
import { emitValidPaths } from "./emit/validPaths";

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
  const repoRoot = path.dirname(context.config.configPath);
  const site = await readSiteConf(repoRoot);
  const publicDir = path.join(repoRoot, "public");

  const posts = (data.posts as any[]).map(normalizePost);
  const pages = (data.pages as any[]).map(normalizePage);

  data.posts = posts;
  data.pages = pages;

  const renderablePosts = [...posts]
    .filter((p) => p.draft !== true)
    .sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
  const publishedPosts = renderablePosts.filter(
    (p) => p.private !== true && p.isTranslation !== true,
  );
  const renderablePages = [...pages].filter((p) => p.draft !== true);

  await emitSitemaps({
    site,
    publicDir,
    renderablePosts,
    renderablePages,
    publishedPosts,
  });

  await emitAtom({
    site,
    publicDir,
    publishedPosts,
    renderablePosts,
  });

  await emitPublicAssets({ site, publicDir });
  const legacyCommentsMap = await loadLegacyCommentsMap(repoRoot);
  const legacyCommentPaths = legacyCommentsMap
    ? collectLegacyCommentPaths(legacyCommentsMap)
    : undefined;
  await emitPublicData({
    publicDir,
    posts,
    pages,
    friends: (data as any).friends ?? [],
    legacyCommentPaths,
  });
  await emitValidPaths({
    publicDir,
    renderablePosts,
    renderablePages,
  });
  await emitLegacyComments({ repoRoot, publicDir, commentsMap: legacyCommentsMap });
};
