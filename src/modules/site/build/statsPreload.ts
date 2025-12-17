import { readFileSync } from "fs";
import path from "path";
import { BlogMinimal } from "~/schema/Post";

type VelitePost = BlogMinimal & {
    draft?: boolean;
    private?: boolean;
    isTranslation?: boolean;
    lang?: string;
    words?: number;
};

type VelitePage = {
    slug: string;
    draft?: boolean;
    private?: boolean;
    isTranslation?: boolean;
    lang?: string;
    weight?: number;
};

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

const groupByYear = (posts: BlogMinimal[]) => {
    let byYears: { [key: string]: number } = {};
    posts.forEach((post) => {
        const year = new Date(post.date).getFullYear()
        if (!byYears[year]) byYears[`${year}`] = 0;
        byYears[year] += 1;
    })
    return byYears
}
const groupByYearDetail = (posts: BlogMinimal[]) => {
    let byYears: { [key: string]: BlogMinimal[] } = { undefined: [] };
    const toTime = (date: unknown) => {
        const time = new Date(String(date ?? "")).getTime();
        return Number.isFinite(time) ? time : 0;
    };

    const sortedPosts = [...posts].sort((a, b) => toTime(b.date) - toTime(a.date));
    sortedPosts.forEach((post) => {
        const year = new Date(post.date).getFullYear()
        if (!byYears[year]) byYears[`${year}`] = [];
        const ret = { slug: `/posts/${post.slug}/` }
        if (post.subtitle) ret['subtitle'] = post.subtitle
        ret['title'] = post.title
        ret['category'] = post.category
        ret['date'] = post.date

        byYears[year].push(ret)
    })
    return byYears
}

function range(arr, size) {
    const initSeed = new Date().getDate()
    let idx = initSeed, result = []
    for (var i = 0; i < size; i++) {
        idx = (idx + initSeed ** 2) % arr.length
        result.push(arr[idx])
    }
    return result;
};


const wordsCount = posts.reduce((acc, post) => acc + (post.words ?? 0), 0);
const totalPosts = posts.length;

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

const en_posts = zhWithLang
    .map((p) =>
        p.slug.endsWith("-zh") ? p.slug.replace("-zh", "-en") : `${p.slug}-en`,
    )
    .map((slug) => `/posts/${slug}/`)
    .concat(pages.map((p) => `/${p.slug}-en/`))
    .concat(["/archives-en/"])
    .concat(posts.filter((p) => p.lang === "en").map((p) => `/posts/${p.slug}/`));

const totalTags = tagsCount;
const totalCategories = categoryCounts;
const postsByYear = groupByYear(posts);
const postsByYearDetail = groupByYearDetail(posts);

const zh_nav_pages = pages.map((x) => x.slug).filter((x) => !x.includes("search"));
const en_nav_pages = zh_nav_pages.map(x => `${x}-en`)


export { en_nav_pages, en_posts, postsByYear, postsByYearDetail, totalCategories, totalPosts, totalTags, wordsCount, zh_nav_pages };
