import { useLocation } from "@solidjs/router";
import { JSXElement, Show, createMemo, lazy, onCleanup, onMount } from "solid-js";
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
        lang: blog.lang,
        isTranslation: blog.isTranslation,
        toc: blog.toc,
        genre: "Technology",
    };
};

type PostProps = {
    children: JSXElement;
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
    onMount(() => {
        if (!hash()) return;
        const id = decodeURIComponent(hash()).replace(/^#/, "");
        if (!id) return;
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    });
    onMount(() => {
        const root = document.getElementById("blog-article");
        if (!root) return;
        const disposeBlocks = setupCodeBlocks(root, {
            copyLabel: () => LL().sidebar.CODE.copy(),
            copiedLabel: () => LL().sidebar.CODE.copied(),
        });
        onCleanup(() => disposeBlocks());
    });

    const blog = rawBlog;
    const headParams = constructHeadParams(blog);

    let wrapper: JSXElement;
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

export default ArticlePage;
