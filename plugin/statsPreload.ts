import { BlogMinimal } from "~/schema/Post";
import bases from "../(hugo)/base/index.json";
import categories from "../(hugo)/category/index.json";
import blogs from "../(hugo)/posts/index.json";
import tags from "../(hugo)/tags/index.json";

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
    posts.forEach((post) => {
        const year = new Date(post.date).getFullYear()
        if (!byYears[year]) byYears[`${year}`] = [];
        const ret = { slug: `/posts/${post.slug}/` }
        if (post.subtitle) ret['subtitle'] = post.subtitle
        ret['title'] = post.title
        ret['category'] = post.category
        ret['data'] = post.date

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


const wordsCount = blogs.pages.reduce((acc, post) => {
    return acc + post.words
}, 0)
const totalPosts = blogs.pages.length
const en_posts = blogs.pages.filter((post) => post.lang !== undefined).filter(x => x.lang?.startsWith("zh")).map(x =>
    x.slug.endsWith("-zh") ? x.slug.replace("-zh", "-en") : x.slug + "-en"
).concat(bases.pages.map(x => `${x.slug}-en`)).concat(["archives-en"]).concat(blogs.pages.filter((post) => post.lang === "en").map(x => x.slug))

const totalTags = tags.pages.length
const totalCategories = categories.pages
const postsByYear = groupByYear(blogs.pages)
const postsByYearDetail = groupByYearDetail(blogs.pages)
const zh_nav_pages = bases.pages.map(x => x.slug).filter(x => !x.includes("search"))
const en_nav_pages = zh_nav_pages.map(x => `${x}-en`)


export { en_nav_pages, en_posts, postsByYear, postsByYearDetail, totalCategories, totalPosts, totalTags, wordsCount, zh_nav_pages };


