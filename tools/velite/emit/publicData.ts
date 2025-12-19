import fs from "node:fs/promises";
import path from "node:path";
import {
  byDateDesc,
  canonicalPosts,
  computeNeighbours,
  computeRelated,
  postMeta,
  postUrl,
  safePathSegment,
  visiblePages,
  visiblePosts,
} from "../shared";

type EmitPublicDataOptions = {
  publicDir: string;
  posts: any[];
  pages: any[];
  friends?: any[];
};

const writeJson = async (filepath: string, data: unknown) => {
  await fs.mkdir(path.dirname(filepath), { recursive: true });
  await fs.writeFile(filepath, JSON.stringify(data), "utf8");
};

const clearOutDir = async (targetDir: string) => {
  await fs.rm(targetDir, { recursive: true, force: true });
  await fs.mkdir(targetDir, { recursive: true });
};

const buildCategoryOutputs = async ({ canon, outDir }: { canon: any[]; outDir: string }) => {
  const categoryIndex: Array<{ title: string; count: number; url: string }> = [];
  const byCategory = new Map<string, any[]>();
  for (const p of canon) {
    const c = String(p.category ?? "");
    if (!c) continue;
    const list = byCategory.get(c) ?? [];
    list.push(p);
    byCategory.set(c, list);
  }

  for (const [title, list] of Array.from(byCategory.entries()).sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    const data = byDateDesc(list).map((p) => postMeta(p, { includeSummary: true }));
    await writeJson(path.join(outDir, "category", `${safePathSegment(title)}.json`), data);
    categoryIndex.push({ title, count: list.length, url: `/category/${encodeURIComponent(title)}/` });
  }
  await writeJson(path.join(outDir, "category", "index.json"), categoryIndex);
};

const buildPostOutputs = async ({
  visPosts,
  canon,
  canonSlugSet,
  slugToPost,
  outDir,
}: {
  visPosts: any[];
  canon: any[];
  canonSlugSet: Set<string>;
  slugToPost: Map<string, any>;
  outDir: string;
}) => {
  for (const p of visPosts) {
    const slug = String(p.slug);
    const neighbours = computeNeighbours(p, { canon, canonSlugSet, slugToPost });
    const relates = computeRelated(p, canon);
    const html = String(p.html ?? "");
    const hasMath = !!p.mathrender || html.includes("katex");
    const data = {
      ...p,
      url: postUrl(slug),
      neighbours,
      relates,
      hasMath,
    };
    await writeJson(path.join(outDir, "posts", `${safePathSegment(slug)}.json`), data);
  }
};

const buildPageOutputs = async ({ pages, outDir }: { pages: any[]; outDir: string }) => {
  const visPages = visiblePages(pages);
  for (const p of visPages) {
    const slug = String(p.slug);
    await writeJson(path.join(outDir, "pages", `${safePathSegment(slug)}.json`), {
      ...p,
      url: `/${slug}/`,
    });
  }
};

export const emitPublicData = async ({ publicDir, posts, pages, friends = [] }: EmitPublicDataOptions) => {
  const outDir = path.join(publicDir, "_data");
  await clearOutDir(outDir);

  const visPosts = visiblePosts(posts);
  const canon = byDateDesc(canonicalPosts(posts));
  const canonSlugSet = new Set(canon.map((p) => String(p.slug)));
  const slugToPost = new Map(visPosts.map((p) => [String(p.slug), p]));

  const latest = canon.slice(0, 5).map((p, idx) => postMeta(p, { includeSummary: idx === 0 }));
  await writeJson(path.join(outDir, "posts", "latest.json"), latest);

  await buildCategoryOutputs({ canon, outDir });
  await buildPostOutputs({ visPosts, canon, canonSlugSet, slugToPost, outDir });
  await buildPageOutputs({ pages, outDir });

  await writeJson(path.join(outDir, "friends.json"), friends);
};
