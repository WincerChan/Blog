import { readFileSync } from "fs";
import path from "path";
import { BlogDetailed, BlogMinimal } from "~/schema/Post";

type sameTagsArgs = {
    [key: string]: BlogDetailed[]
}


const findRelatedPosts = (sameTagPosts: sameTagsArgs, sameCatePosts: BlogMinimal[]) => {
    const blogScore: {
        [key: string]: {
            score: number,
            blog: BlogMinimal
        }
    } = {};
    Object.entries(sameTagPosts).map(([tag, blogs]) => {
        blogs.map(blog => {
            if (blogScore[blog.slug]) {
                blogScore[blog.slug].score += 1
            } else {
                blogScore[blog.slug] = {
                    score: 1,
                    blog
                }
            }
        })
    })
    sameCatePosts.map((blog) => {
        if (blogScore[blog.slug]) {
            blogScore[blog.slug].score += 0.5
        } else {
            blogScore[blog.slug] = {
                score: 0.5,
                blog
            }
        }
    })

    const sortedBlogs = Object.values(blogScore)
        .sort((a, b) => b.score - a.score)
        .map((blog) => (
            {
                "title": blog.blog.title,
                "slug": blog.blog.slug,
                "date": blog.blog.date,
                "score": blog.score
            }
        ))
    return sortedBlogs.slice(0, 6)
}

const getSameTaxoBlogs = (tags: string[], category: string, slug: string) => {
    let sameCateBlogs = [], sameTagBlogs: sameTagsArgs = {};
    const sameCate = readFileSync(path.join(process.cwd(), '_output/category', `${category}/index.jsonx`), 'utf-8');
    sameCateBlogs.push(...JSON.parse(sameCate).pages.filter((blog: BlogMinimal) => blog.slug != slug))
    const sameTags = tags.map(tag => JSON.parse(readFileSync(path.join(process.cwd(), '_output/tags', `${tag}/index.jsonx`), 'utf-8')))
    sameTags.forEach(tag => sameTagBlogs[tag.term] = tag.pages.filter((blog: BlogMinimal) => blog.slug !== slug))
    return findRelatedPosts(sameTagBlogs, sameCateBlogs)
}

const PostLoader = (parsedContent: BlogDetailed) => {
    const relates = getSameTaxoBlogs(parsedContent.tags, parsedContent.category, parsedContent.slug)
    const { content, ...rest } = parsedContent
    const transformedCode = `
        import PostLayout from "~/components/layouts/PostLayout"
        import Img from "~/components/lazy/Img"
        import { A } from "solid-start"
        import { lazy } from "solid-js";

        const MathRender = lazy(() => import("~/components/lazy/MathRender"))
        const Pre = lazy(() => import("~/components/lazy/Pre"))
        
        const Post = () => {
            return (
                <PostLayout rawBlog={${JSON.stringify(rest)}} relates={${JSON.stringify(relates)}}>
                    ${content}
                </PostLayout>
            )
        }
        export default Post;
    `
    return {
        code: transformedCode,
        map: null
    }
}

export default PostLoader;