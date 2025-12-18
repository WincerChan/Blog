import path from "node:path";
import type { VeliteConfig } from "velite";
import { parseDateLikeHugo } from "./time";
import { readSiteConf } from "./site";
import { emitAtom } from "./emit/atom";
import { emitPublicAssets } from "./emit/publicAssets";
import { emitSitemaps } from "./emit/sitemap";

export const prepareVelite: VeliteConfig["prepare"] = async (data, context) => {
  const repoRoot = path.dirname(context.config.configPath);
  const site = await readSiteConf(repoRoot);
  const publicDir = path.join(repoRoot, "public");

  const posts = (data.posts as any[]).map((p) => {
    const dateObj = parseDateLikeHugo(p.date);
    const updatedObj = parseDateLikeHugo(p.updated ?? p.date);

    return {
      ...p,
      tags: Array.isArray(p.tags) ? p.tags.map((x) => String(x)).filter(Boolean) : [],
      dateObj,
      updatedObj,
      url: `/posts/${String(p.slug)}/`,
    };
  });

  const pages = (data.pages as any[]).map((p) => {
    const dateObj = parseDateLikeHugo(p.date);
    const updatedObj = parseDateLikeHugo(p.updated ?? p.date);

    return {
      ...p,
      dateObj,
      updatedObj,
      url: `/${String(p.slug)}/`,
    };
  });

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
};

