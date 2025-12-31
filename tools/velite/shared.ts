type VelitePostBase = {
  slug: string;
  title: string;
  date: string;
  updated?: string;
  category?: string;
  tags?: string[];
  subtitle?: string;
  draft?: boolean;
  private?: boolean;
  isTranslation?: boolean;
  lang?: string;
  cover?: string;
  summary?: string;
  words?: number;
  html?: string;
  mathrender?: boolean;
  dateObj?: unknown;
};

type VelitePageBase = {
  slug: string;
  weight?: number;
  draft?: boolean;
  private?: boolean;
  isTranslation?: boolean;
};

type CanonContext = {
  canon: VelitePostBase[];
  canonSlugSet: Set<string>;
  slugToPost: Map<string, VelitePostBase>;
};

type PostNeighbourLink = { title: string; slug: string };
type PostNeighbours = { prev?: PostNeighbourLink; next?: PostNeighbourLink };

export const toTime = (value: unknown) => {
  const time = new Date(String(value ?? "")).getTime();
  return Number.isFinite(time) ? time : 0;
};

export const postTime = (post: { dateObj?: unknown; date?: unknown }) =>
  toTime(post?.dateObj ?? post?.date);

export const byDateDesc = <T extends { dateObj?: unknown; date?: unknown }>(items: T[]) =>
  [...items].sort((a, b) => postTime(b) - postTime(a));

export const postUrl = (slug: string) => `/posts/${slug}/`;

export const langShort = (post: { lang?: string; slug?: string }) =>
  String(post?.lang ?? "").split("-")[0] || "";

export const visiblePosts = <T extends { draft?: boolean; private?: boolean }>(posts: T[]) =>
  posts.filter((p) => p?.draft !== true).filter((p) => p?.private !== true);

export const canonicalPosts = <T extends { isTranslation?: boolean; draft?: boolean; private?: boolean }>(
  posts: T[],
) => visiblePosts(posts).filter((p) => p?.isTranslation !== true);

export const visiblePages = <T extends { draft?: boolean; private?: boolean; weight?: number }>(pages: T[]) =>
  pages
    .filter((p) => p?.draft !== true)
    .filter((p) => p?.private !== true)
    .sort((a, b) => (b?.weight ?? 0) - (a?.weight ?? 0));

export const postMeta = (p: VelitePostBase, { includeSummary = true } = {}) => ({
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

export const deriveCanonicalSlug = (
  slug: string,
  canonSlugSet: Set<string>,
  preferred?: string,
) => {
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

export const deriveTranslatedSlug = (canonicalSlug: string, target: string) => {
  const s = String(canonicalSlug ?? "");
  const t = String(target ?? "");
  if (!t) return s;
  if (t === "en") return s.endsWith("-zh") ? s.replace(/-zh$/, "-en") : `${s}-en`;
  if (t === "zh") return s.endsWith("-en") ? s.replace(/-en$/, "-zh") : s;
  return s;
};

export const computeNeighbours = (current: VelitePostBase, { canon, canonSlugSet, slugToPost }: CanonContext) => {
  const toLink = (p?: VelitePostBase): PostNeighbourLink | undefined =>
    p ? { title: p.title, slug: postUrl(String(p.slug)) } : undefined;

  const currentSlug = String(current?.slug ?? "");
  const isTranslated = current?.isTranslation === true;
  if (!isTranslated) {
    const idx = canon.findIndex((p) => String(p.slug) === currentSlug);
    const prev = idx >= 0 ? canon[idx + 1] : undefined;
    const next = idx >= 0 ? canon[idx - 1] : undefined;
    return { prev: toLink(prev), next: toLink(next) } as PostNeighbours;
  }

  const preferred =
    langShort(current) || (currentSlug.endsWith("-en") ? "en" : currentSlug.endsWith("-zh") ? "zh" : "");
  const canonicalSlug = deriveCanonicalSlug(currentSlug, canonSlugSet, preferred);
  const idx = canonicalSlug ? canon.findIndex((p) => String(p.slug) === canonicalSlug) : -1;
  const prevBase = idx >= 0 ? canon[idx + 1] : undefined;
  const nextBase = idx >= 0 ? canon[idx - 1] : undefined;

  const mapToSameLang = (base?: VelitePostBase): PostNeighbourLink | undefined => {
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

export const computeRelated = (current: VelitePostBase, canon: VelitePostBase[]) => {
  const sameCate = String(current?.category ?? "");
  const tags = new Set((current?.tags ?? []).map(String));
  const scores = new Map<string, { score: number; p: VelitePostBase }>();

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

export const safePathSegment = (value: string) =>
  String(value ?? "")
    .replace(/\0/g, "")
    .replace(/[\\/]/g, "_")
    .trim();
