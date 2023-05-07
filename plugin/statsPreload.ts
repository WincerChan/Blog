import blogs from "../_output/posts/index.json";
import tags from "../_output/tags/index.json";
import { shuffle } from "../src/utils";

const wordsCount = blogs.pages.reduce((acc, post) => {
    return acc + post.words
}, 0)
const totalPosts = blogs.pages.length

const randomTags = shuffle(tags.pages).map((tag) => tag.title).slice(0, 22)

export { wordsCount, randomTags, totalPosts };
