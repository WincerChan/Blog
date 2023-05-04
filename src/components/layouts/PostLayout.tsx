import { AES, enc } from "crypto-js";
import { JSXElement, Show, createSignal } from "solid-js";
import { A } from "solid-start";
import { HeadParamsSchema } from "~/schema/Head";
import { BlogDetailed, BlogDetailedSchema, BlogScoreSchema } from "~/schema/Post";
import { calculateDateDifference, formatDate, padTo32 } from "~/utils";
import Copyright from "../core/section/Copyright";
import DisqusComment from "../core/section/Disqus";
import TagCollection from "../core/section/Tag";
import ArticleTitle from "../core/section/Title";
import { BlogPostParams } from "../core/sidebar/types";
import LazyBg from "../lazy/BG";
import LazyImg from "../lazy/Img";
import ContentLayout from "./ContentLayout";

const PostMeta = ({ blog }: { blog: BlogDetailed }) => {
    return (
        <LazyBg dataSrc={blog.cover} class="bg-center bg-cover bg-clip-text backdrop-filter backdrop-blur-lg text-opacity-60 text-[var(--meta-bg)]" >
            <div class="flex items-center overflow-x-scroll <md:mx-4 hyphens-auto whitespace-nowrap space-x-4 scrollbar-none leading-loose">
                <span>{formatDate(blog.date)}</span>
                <div class="h-0.5 w-0.5 mx-4 rounded-full bg-[var(--subtitle)]"></div>
                <TagCollection tags={blog.tags} />
            </div>
            <ArticleTitle title={blog.title} words={blog.words} />
            {blog.subtitle && <h2 class="text-2xl <md:mx-4 font-headline leading-relaxed <md:leading-relaxed <md:text-[1.4rem]">{blog.subtitle}</h2>}
        </LazyBg>
    )
}

const ExpiredNotify = ({ date }: { date: Date }) => {
    // 90 days
    if ((new Date().getTime() - date.getTime()) < 90 * 24 * 60 * 60 * 1000) return <></>
    return (
        <div class="pl-3 my-4 border-l-4 border-[#f9c116]">
            <p>本文最近一次更新于{calculateDateDifference(date, new Date())}前，其中的内容很可能已经有所发展或是发生改变。</p>
        </div>
    )
}

const Neighbours = ({ neighbours }: BlogDetailed) => {
    const { prev, next } = neighbours;
    return (
        <div class="leading-loose my-6 flex justify-between flex-wrap text-xl <md:mx-4">
            {next && <A href={next.slug} class="mr-auto text-menuHover my-2 flex inline-flex items-center">
                <i title="prev" class="i-carbon-arrow-left w-6 h-6 mr-2" />{next.title}</A>}
            {prev && <A href={prev.slug} class="ml-auto text-menuHover my-2 flex inline-flex items-center">
                {prev.title}<i class="i-carbon-arrow-right w-6 h-6 ml-2" /></A>}
        </div>
    )
}

const constructHeadParams = (blog: BlogDetailed) => {
    return HeadParamsSchema.parse({
        title: blog.title,
        description: blog.summary,
        date: blog.updated,
        keywords: blog.tags,
        pageURL: blog.slug,
        words: blog.words,
        subtitle: blog.subtitle,
        cover: blog.cover,
        updated: blog.updated
    })
}

const useEncrypt = (rawContent: string, passwd: string | undefined, children: JSXElement) => {
    const key = enc.Hex.parse(padTo32(passwd ? passwd : ""))
    const [show, setShow] = createSignal(false)
    const [content, setContent] = createSignal(passwd ? AES.encrypt(rawContent, key, { iv: key }).toString() : "")
    const [error, setError] = createSignal(false)
    if (!passwd) return <section>{children}</section>

    const handleDecrypt = (e) => {
        e.preventDefault()
        const input = (e.currentTarget[0] as HTMLInputElement).value
        const key = enc.Hex.parse(padTo32(input))
        try {
            const decrypted = AES.decrypt(content(), key, { iv: key })
            setContent(decrypted.toString(enc.Utf8))
            setShow(true)
            setError(false)
        } catch (error) {
            setError(true)
        }
    }
    return (
        <>
            <Show when={!show()}>
                <form onSubmit={handleDecrypt} class="flex space-x-4 my-6 <md:mx-4">
                    <input type="text" class="card-outline bg-[var(--cc)] px-4 py-1.5 rounded flex-grow" placeholder="你面前的是一个未知的领域，输入密码才能继续前进。" />
                    <button title="解密" class="font-headline px-4 card-outline rounded">解密</button>
                </form>
            </Show>
            <Show when={error()}><b>密码错误，这个未知的领域离你还很遥远。</b></Show>
            <Show when={show()}><section innerHTML={content()} /></Show>
        </>
    )
}


const PostLayout = ({ children, rawBlog, relates }) => {
    const blog = BlogDetailedSchema.parse(rawBlog)
    const blogParams: BlogPostParams = {
        toc: blog.toc,
        relates: relates?.map(r => BlogScoreSchema.parse(r))
    }
    children = useEncrypt(blog.content, blog.password, children)
    const headParams = constructHeadParams(blog);

    return (
        <ContentLayout blog={blogParams} headParams={headParams} >
            <LazyImg class="w-full blog-cover rounded object-cover mb-6" src={blog.cover} alt={blog.cover} />
            <PostMeta blog={blog} />
            <ExpiredNotify date={blog.updated} />
            {children}
            <Copyright {...blog} />
            <Neighbours {...blog} />
            <DisqusComment slug={headParams.pageURL} />
        </ContentLayout>
    )
}

export default PostLayout