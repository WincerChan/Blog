import { readFileSync } from "node:fs";
import path from "node:path";
import type { VelitePage, VelitePost } from "../../../src/content/types";

const readJson = <T>(filepath: string, fallback: T): T => {
  try {
    return JSON.parse(readFileSync(filepath, "utf8")) as T;
  } catch {
    return fallback;
  }
};

const repoRoot = process.cwd();
const postsPath = path.join(repoRoot, ".velite", "posts.json");
const pagesPath = path.join(repoRoot, ".velite", "pages.json");

const allPosts = readJson<VelitePost[]>(postsPath, []);
const allPages = readJson<VelitePage[]>(pagesPath, []);

const posts = allPosts
  .filter((p) => p.draft !== true)
  .filter((p) => p.private !== true)
  .filter((p) => p.isTranslation !== true);

const pages = allPages
  .filter((p) => p.draft !== true)
  .filter((p) => p.private !== true)
  .filter((p) => p.isTranslation !== true)
  .sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0));

type ArchiveListItem = {
  slug: string;
  title: string;
  date: string;
  category?: string;
  subtitle?: string;
};

const groupByYear = (posts: VelitePost[]) => {
  const byYears: { [key: string]: number } = {};
  posts.forEach((post) => {
    const year = new Date(post.date).getFullYear();
    if (!byYears[year]) byYears[`${year}`] = 0;
    byYears[year] += 1;
  });
  return byYears;
};

const groupByYearDetail = (posts: VelitePost[]) => {
  const byYears: { [key: string]: ArchiveListItem[] } = { undefined: [] };
  const toTime = (date: unknown) => {
    const time = new Date(String(date ?? "")).getTime();
    return Number.isFinite(time) ? time : 0;
  };

  const sortedPosts = [...posts].sort((a, b) => toTime(b.date) - toTime(a.date));
  sortedPosts.forEach((post) => {
    const year = new Date(post.date).getFullYear();
    if (!byYears[year]) byYears[`${year}`] = [];
    byYears[year].push({
      slug: `/posts/${post.slug}/`,
      title: post.title,
      category: post.category,
      date: post.date,
      subtitle: post.subtitle,
    });
  });
  return byYears;
};

const contentStatsWordsCount = posts.reduce((acc, post) => acc + (post.words ?? 0), 0);
const contentStatsTotalPosts = posts.length;

const tagsCount = new Set(posts.flatMap((p) => (p.tags ?? []) as string[])).size;
const categoryCounts = Object.entries(
  posts.reduce((acc: Record<string, number>, p) => {
    const key = p.category;
    if (!key) return acc;
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {}),
).map(([title, count]) => ({ title, count }));

const zhWithLang = posts
  .filter((p) => p.lang !== undefined)
  .filter((p) => p.lang?.startsWith("zh"));

const contentStatsEnPosts = zhWithLang
  .map((p) => (p.slug.endsWith("-zh") ? p.slug.replace("-zh", "-en") : `${p.slug}-en`))
  .map((slug) => `/posts/${slug}/`)
  .concat(pages.map((p) => `/${p.slug}-en/`))
  .concat(["/archives-en/"])
  .concat(posts.filter((p) => p.lang === "en").map((p) => `/posts/${p.slug}/`));

const contentStatsTotalTags = tagsCount;
const contentStatsTotalCategories = categoryCounts;
const contentStatsPostsByYear = groupByYear(posts);
const contentStatsPostsByYearDetail = groupByYearDetail(posts);

const contentStatsZhNavPages = pages.map((x) => x.slug).filter((x) => !x.includes("search"));
const contentStatsEnNavPages = contentStatsZhNavPages.map((x) => `${x}-en`);

export {
  contentStatsEnNavPages,
  contentStatsEnPosts,
  contentStatsPostsByYear,
  contentStatsPostsByYearDetail,
  contentStatsTotalCategories,
  contentStatsTotalPosts,
  contentStatsTotalTags,
  contentStatsWordsCount,
  contentStatsZhNavPages,
};
