import { BlogMinimal } from "~/schema/Post";
import blogs from "../_output/posts/index.json";
import tags from "../_output/tags/index.json";
import en_langs from "./lang/en/en";
import zh_langs from "./lang/zh/zh";

const groupByYear = (posts: BlogMinimal[]) => {
    let byYears: { [key: string]: number } = {};
    posts.forEach((post) => {
        const year = new Date(post.date).getFullYear()
        if (!byYears[year]) byYears[`${year}`] = 0;
        byYears[year] += 1;
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
const en_posts = blogs.pages.filter((post) => post.lang === "en").map(x => x.slug)

const randomTags = range(tags.pages.map((tag) => tag.title), 16)
const totalTags = tags.pages.length
const postsByYear = groupByYear(blogs.pages)

export { en_posts, postsByYear, randomTags, totalPosts, totalTags, wordsCount };

export { en_langs, zh_langs };

