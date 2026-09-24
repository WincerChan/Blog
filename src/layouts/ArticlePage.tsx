import { useLocation } from "@solidjs/router";
import { Element, Show, createEffect, createMemo, lazy, onSettled } from "solid-js";
import { useI18nContext } from "~/i18n/i18n-solid";
import ArticleLayout from "~/layouts/ArticleLayout";
import PostMeta from "~/features/article/blocks/PostMeta";
import PostActions from "~/features/article/blocks/PostActions";
import PostExtra from "~/features/article/blocks/PostExtra";
import { setupCodeBlocks } from "~/features/article/components/CodeBlockHeader";
import type { ArticleMeta, RelatedPost } from "~/features/article/types";

const ProtectBlog = lazy(() => import("~/features/article/blocks/EncryptBlock"));


const constructHeadParams = (blog: ArticleMeta) => {
    return {
        title: blog.title,
        description: blog.summary || blog.title,
        date: blog.date,
        keywords: blog.tags,
        pageURL: blog.slug,
        words: blog.words,
        subtitle: blog.subtitle || "",
        cover: blog.cover ?? "",
        updated: blog.updated ?? blog.date,
        hasMath: !!blog.hasMath,
        inkstoneToken: blog.inkstoneToken,
        discussionUrl: blog.discussionUrl,
        lang: blog.lang,
        isTranslation: blog.isTranslation,
        toc: blog.toc,
        genre: "Technology",
    };
};

type PostProps = {
    children: Element;
    rawBlog: ArticleMeta;
    relates: RelatedPost[];
    hideComment?: boolean;
    hideActions?: boolean;
};

const ArticlePage = ({
    children,
    rawBlog,
    relates,
    hideComment,
    hideActions,
}: PostProps) => {
    const { LL, locale } = useI18nContext();
    const hash = createMemo(() => useLocation().hash);
    onSettled(() => {
        if (!hash()) return;
        const id = decodeURIComponent(hash()).replace(/^#/, "");
        if (!id) return;
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    });
    // Code block headers create their own render roots; onSettled forbids nested primitives.
    createEffect(() => true, () => {
        const root = document.getElementById("blog-article");
        if (!root) return;
        const disposeBlocks = setupCodeBlocks(root, {
            copyLabel: () => LL().sidebar.CODE.copy(),
            copiedLabel: () => LL().sidebar.CODE.copied(),
        });
        return disposeBlocks;
    });

    const blog = rawBlog;
    const headParams = constructHeadParams(blog);

    let wrapper: Element;
    if (blog.encrypted) wrapper = <ProtectBlog source={children} />;
    else
        wrapper = (
            <div id="blog-article" class="prose dark:prose-invert md:text-[1.05rem]  max-w-[42rem]">
                {children}
            </div>
        );

    return (
        <ArticleLayout headParams={headParams}>
            <PostMeta blog={blog} lang={locale} LL={LL} />
            {wrapper}
            <Show when={!hideActions}>
                <PostActions pageURL={blog.slug} inkstoneToken={blog.inkstoneToken} />
            </Show>
            <PostExtra
                rawBlog={blog}
                relates={relates}
                hideComment={hideComment}
                LL={LL}
            />
        </ArticleLayout>
    );
};

const notFoundContent = "您访问的页面已经消失得无影无踪，就像我的前任一样。";
const notFoundPage: ArticleMeta = {
    title: "404 Not Found",
    date: new Date().toDateString(),
    updated: new Date().toDateString(),
    cover: "",
    tags: [],
    category: "",
    words: 0,
    toc: "",
    neighbours: {},
    slug: "404",
    summary: notFoundContent,
};

export const ArticleNotFound = () => (
    <>
        <ArticlePage rawBlog={notFoundPage} relates={[]} hideComment={true}>
            <section class="">
                <p class="">{notFoundContent}</p>
            </section>
        </ArticlePage>
    </>
);

export default ArticlePage;
