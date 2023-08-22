import { JSXElement, Show, createMemo, lazy, onMount } from "solid-js";
import { A, useLocation } from "solid-start";
import { BlogDetailed, BlogScore } from "~/schema/Post";
import { calculateDateDifference, formatDate } from "~/utils";
import Relates from "../core/footer/Relates";
import DisqusComment from "../core/section/Comment";
import Copyright from "../core/section/Copyright";
import TagCollection from "../core/section/Tag";
import LazyBg from "../lazy/BG";
import { ArticleLayout } from "./ContentLayout";

const ProtectBlog = lazy(() => import("./EncryptBlock"))

const PostMeta = ({ blog }: { blog: BlogDetailed }) => {
    const publishedDate = new Date(blog.date);
    const isRecently = (new Date().getTime() - publishedDate.getTime()) < 90 * 24 * 60 * 60 * 1000
    return (
        <>
            <LazyBg dataSrc={blog.cover} class=":: bg-center bg-cover bg-clip-text backdrop-filter backdrop-blur-lg text-opacity-60 text-[var(--meta-bg)] " >
                <h1 class=":: font-headline leading-loose title-responsive ">{blog.title}</h1>
                <Show when={!!blog.subtitle}>
                    <h2 class=":: font-headline leading-relaxed subtitle-responsive mb-2 ">{blog.subtitle}</h2>
                </Show>
                <Show when={blog.category}>
                    <div id="post-meta" class=":: flex items-center overflow-x-scroll hyphens-auto whitespace-nowrap space-x-4 scrollbar-none leading-loose ">
                        <span>
                            {formatDate(blog.date)}
                        </span>
                        <div class=":: h-0.5 w-0.5 mx-4 overflow-y-hidden flex-none rounded-full bg-[var(--subtitle)] "></div>
                        <Show when={blog.words}>
                            <span class="">{blog.words} 字</span>
                        </Show>
                        <div class=":: h-0.5 w-0.5 mx-4 overflow-y-hidden flex-none rounded-full bg-[var(--subtitle)] "></div>
                        <TagCollection tags={blog.tags} />
                    </div>
                </Show>
            </LazyBg >
            <Show when={blog.category && !isRecently}>
                <div class=":: pl-3 text-lg my-4 border-l-6 border-amber-200 text-[var(--notify)] py-3 pr-4 mobile-width-beyond">
                    <p>本文最近一次更新于{calculateDateDifference(new Date(blog.updated))}前，其中的内容很可能已经有所发展或是发生改变。</p>
                </div>
            </Show>

        </>
    )
}


export const Neighbours = ({ neighbours }: BlogDetailed) => {
    const { prev, next } = neighbours;
    return (
        <div class=":: leading-loose my-6 flex justify-between flex-wrap text-xl ">
            {next && <A href={next.slug} inactiveClass="" class=":: mr-auto text-menuHover my-2 flex inline-flex items-center ">
                <i title="prev" class=":: i-carbon-arrow-left w-6 h-6 mr-2 " />{next.title}</A>}
            {prev && <A href={prev.slug} inactiveClass="" class=":: ml-auto text-menuHover my-2 flex inline-flex items-center ">
                {prev.title}<i title="next" class=":: i-carbon-arrow-right w-6 h-6 ml-2 " /></A>}
        </div>
    )
}

const constructHeadParams = (blog: BlogDetailed) => {
    return {
        title: blog.title,
        description: blog.summary,
        date: blog.date,
        keywords: blog.tags,
        pageURL: blog.slug,
        words: blog.words,
        subtitle: blog.subtitle,
        cover: blog.cover,
        updated: blog.updated,
    }
}

type PostProps = {
    children: JSXElement,
    rawBlog: BlogDetailed,
    relates: BlogScore[],
    hideComment?: boolean
}

const PostLayout = ({ children, rawBlog, relates, hideComment }: PostProps) => {
    const hash = createMemo(() => useLocation().hash)
    onMount(() => {
        if (!hash()) return
        const id = decodeURIComponent(hash())
        document.querySelector(id)?.scrollIntoView({ behavior: "smooth" })
    })

    const
        blog = rawBlog,
        blogParams = {
            toc: blog.toc,
            relates: relates
        },
        headParams = constructHeadParams(blog);

    let wrapper: JSXElement
    if (!!blog.password) wrapper = <ProtectBlog source={children} />
    else wrapper = <section id="blog-article">{children}</section>

    let extra = <PostExtra rawBlog={blog} relates={relates} headParams={headParams} hideComment={hideComment} />
    return (
        <ArticleLayout blog={blogParams} headParams={headParams} rawBlog={blog} extra={extra} >
            <PostMeta blog={blog} />
            <Show when={blog.cover}>
                <img class=":: w-full blog-cover rounded object-cover my-6 mobile-width-beyond! " src={blog.cover} alt={blog.cover} />
            </Show>
            {wrapper}
        </ArticleLayout>
    )
}

export const PostExtra = ({ rawBlog, relates, hideComment }) => {
    return (
        <>
            <Show when={rawBlog.category}>
                <Copyright {...rawBlog} />
                <Relates relates={relates} />
                <Neighbours neighbours={rawBlog.neighbours} />
            </Show>
            <Show when={!hideComment}>
                <DisqusComment />
            </Show>
        </>
    )
}

export default PostLayout