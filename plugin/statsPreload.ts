import { BlogMinimal } from "~/schema/Post";
import blogs from "../_output/posts/index.json";
import tags from "../_output/tags/index.json";
import { shuffle } from "../src/utils";

const groupByYear = (posts: BlogMinimal[]) => {
    let byYears: { [key: string]: number } = {};
    posts.forEach((post) => {
        const year = new Date(post.date).getFullYear()
        if (!byYears[year]) byYears[`${year}`] = 0;
        byYears[year] += 1;
    })
    return byYears
}


const wordsCount = blogs.pages.reduce((acc, post) => {
    return acc + post.words
}, 0)
const totalPosts = blogs.pages.length

const randomTags = shuffle(tags.pages.map((tag) => tag.title)).slice(0, 16)
const totalTags = tags.pages.length
const postsByYear = groupByYear(blogs.pages)

export { postsByYear, randomTags, totalPosts, totalTags, wordsCount };

