import fs from "node:fs/promises";
import path from "node:path";

const repoRoot = process.cwd();
const veliteDir = path.join(repoRoot, ".velite");
const outDir = path.join(repoRoot, "public", "_data");

const readJson = async (filepath) => JSON.parse(await fs.readFile(filepath, "utf8"));

const writeJson = async (filepath, data) => {
  await fs.mkdir(path.dirname(filepath), { recursive: true });
  await fs.writeFile(filepath, JSON.stringify(data), "utf8");
};

const toTime = (value) => {
  const time = new Date(String(value ?? "")).getTime();
  return Number.isFinite(time) ? time : 0;
};

const postTime = (post) => toTime(post?.dateObj ?? post?.date);

const byDateDesc = (items) => [...items].sort((a, b) => postTime(b) - postTime(a));

const postUrl = (slug) => `/posts/${slug}/`;

const langShort = (post) => String(post?.lang ?? "").split("-")[0] || "";

const visiblePosts = (posts) =>
  posts.filter((p) => p?.draft !== true).filter((p) => p?.private !== true);

const canonicalPosts = (posts) => visiblePosts(posts).filter((p) => p?.isTranslation !== true);

const visiblePages = (pages) =>
  pages
    .filter((p) => p?.draft !== true)
    .filter((p) => p?.private !== true)
    .sort((a, b) => (b?.weight ?? 0) - (a?.weight ?? 0));

const postMeta = (p, { includeSummary = true } = {}) => ({
  slug: String(p.slug),
  url: postUrl(String(p.slug)),
  title: p.title,
  subtitle: p.subtitle,
  date: p.date,
  updated: p.updated ?? p.date,
  cover: p.cover ?? "",
  tags: p.tags ?? [],
  category: p.category ?? "",
  ...(includeSummary ? { summary: p.summary } : {}),
  words: p.words ?? 0,
  lang: p.lang,
  isTranslation: p.isTranslation,
});

const deriveCanonicalSlug = (slug, canonSlugSet, preferred) => {
  const s = String(slug ?? "");
  const order = [];

  if (preferred === "en") {
    if (s.endsWith("-en")) {
      order.push(s.replace(/-en$/, "-zh"));
      order.push(s.replace(/-en$/, ""));
    }
  } else if (preferred === "zh") {
    if (s.endsWith("-zh")) {
      order.push(s.replace(/-zh$/, ""));
      order.push(s.replace(/-zh$/, "-en"));
    } else if (s.endsWith("-en")) {
      order.push(s.replace(/-en$/, "-zh"));
      order.push(s.replace(/-en$/, ""));
    }
  } else {
    if (s.endsWith("-en")) {
      order.push(s.replace(/-en$/, "-zh"));
      order.push(s.replace(/-en$/, ""));
    } else if (s.endsWith("-zh")) {
      order.push(s.replace(/-zh$/, ""));
    }
  }

  order.push(s);
  for (const cand of order) if (canonSlugSet.has(cand)) return cand;
  return undefined;
};

const deriveTranslatedSlug = (canonicalSlug, target) => {
  const s = String(canonicalSlug ?? "");
  const t = String(target ?? "");
  if (!t) return s;
  if (t === "en") {
    return s.endsWith("-zh") ? s.replace(/-zh$/, "-en") : `${s}-en`;
  }
  if (t === "zh") {
    return s.endsWith("-en") ? s.replace(/-en$/, "-zh") : s;
  }
  return s;
};

const computeNeighbours = (current, { canon, canonSlugSet, slugToPost }) => {
  const toLink = (p) => (p ? { title: p.title, slug: postUrl(String(p.slug)) } : undefined);

  const currentSlug = String(current?.slug ?? "");
  const isTranslated = current?.isTranslation === true;
  if (!isTranslated) {
    const idx = canon.findIndex((p) => String(p.slug) === currentSlug);
    const prev = idx >= 0 ? canon[idx + 1] : undefined;
    const next = idx >= 0 ? canon[idx - 1] : undefined;
    return { prev: toLink(prev), next: toLink(next) };
  }

  const preferred = langShort(current) || (currentSlug.endsWith("-en") ? "en" : currentSlug.endsWith("-zh") ? "zh" : "");
  const canonicalSlug = deriveCanonicalSlug(currentSlug, canonSlugSet, preferred);
  const idx = canonicalSlug ? canon.findIndex((p) => String(p.slug) === canonicalSlug) : -1;
  const prevBase = idx >= 0 ? canon[idx + 1] : undefined;
  const nextBase = idx >= 0 ? canon[idx - 1] : undefined;

  const mapToSameLang = (base) => {
    if (!base) return undefined;
    const baseSlug = String(base.slug);
    const translatedSlug = deriveTranslatedSlug(baseSlug, preferred);
    const translated = slugToPost.get(translatedSlug);
    if (translated && langShort(translated) === preferred) {
      return { title: translated.title, slug: postUrl(translatedSlug) };
    }
    return { title: base.title, slug: postUrl(baseSlug) };
  };

  return {
    prev: mapToSameLang(prevBase),
    next: mapToSameLang(nextBase),
  };
};

const computeRelated = (current, canon) => {
  const sameCate = String(current?.category ?? "");
  const tags = new Set((current?.tags ?? []).map(String));
  const scores = new Map();

  for (const p of canon) {
    if (String(p.slug) === String(current?.slug)) continue;
    let score = 0;
    if (sameCate && String(p.category ?? "") === sameCate) score += 0.5;
    for (const t of p.tags ?? []) {
      if (tags.has(String(t))) score += 1;
    }
    if (score <= 0) continue;
    scores.set(String(p.slug), { score, p });
  }

  return Array.from(scores.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(({ score, p }) => ({
      title: p.title,
      slug: postUrl(String(p.slug)),
      date: p.date,
      score,
    }));
};

const safePathSegment = (value) =>
  String(value ?? "")
    .replace(/\0/g, "")
    .replace(/[\\/]/g, "_")
    .trim();

const main = async () => {
  const postsPath = path.join(veliteDir, "posts.json");
  const pagesPath = path.join(veliteDir, "pages.json");
  const friendsPath = path.join(veliteDir, "friends.json");

  const [posts, pages, friends] = await Promise.all([
    readJson(postsPath),
    readJson(pagesPath),
    readJson(friendsPath),
  ]);

  await fs.rm(outDir, { recursive: true, force: true });
  await fs.mkdir(outDir, { recursive: true });

  const visPosts = visiblePosts(posts);
  const canon = byDateDesc(canonicalPosts(posts));
  const canonSlugSet = new Set(canon.map((p) => String(p.slug)));
  const slugToPost = new Map(visPosts.map((p) => [String(p.slug), p]));

  const latest = canon.slice(0, 5).map((p, idx) => postMeta(p, { includeSummary: idx === 0 }));
  await writeJson(path.join(outDir, "posts", "latest.json"), latest);

  const categoryIndex = [];
  const byCategory = new Map();
  for (const p of canon) {
    const c = String(p.category ?? "");
    if (!c) continue;
    const list = byCategory.get(c) ?? [];
    list.push(p);
    byCategory.set(c, list);
  }
  for (const [title, list] of Array.from(byCategory.entries()).sort(([a], [b]) => a.localeCompare(b))) {
    const data = byDateDesc(list).map((p) => postMeta(p, { includeSummary: true }));
    await writeJson(path.join(outDir, "category", `${safePathSegment(title)}.json`), data);
    categoryIndex.push({ title, count: list.length, url: `/category/${encodeURIComponent(title)}/` });
  }
  await writeJson(path.join(outDir, "category", "index.json"), categoryIndex);

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

  const visPages = visiblePages(pages);
  for (const p of visPages) {
    const slug = String(p.slug);
    await writeJson(path.join(outDir, "pages", `${safePathSegment(slug)}.json`), {
      ...p,
      url: `/${slug}/`,
    });
  }

  await writeJson(path.join(outDir, "friends.json"), friends);
};

await main();
