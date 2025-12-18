import { createAsync, useParams } from "@solidjs/router";
import { Show, Suspense, createMemo, lazy } from "solid-js";
import ArticlePageLayout from "~/modules/article/layout/ArticlePageLayout";
import { getPageBySlug, pageUrl } from "~/content/velite";
import NotFound from "~/routes/[...404]";

const baseKeyFromSlug = (slug: string) => slug.replace(/-en$/, "");

const Archives = lazy(() => import("~/modules/archives/ArchivesPage"));
const Friends = lazy(() => import("~/modules/friends/FriendsPage"));
const Life = lazy(() => import("~/modules/life/LifePage"));
const Search = lazy(() => import("~/modules/search/SearchPage"));

const toPageProps = (page: any) => ({
    slug: pageUrl(page.slug),
    title: page.title,
    date: page.date,
    updated: page.updated ?? page.date,
    cover: page.cover ?? "",
    summary: page.summary,
    toc: page.toc ?? "",
    category: "",
    tags: [],
    words: 0,
    neighbours: {},
    lang: page.lang,
    isTranslation: page.isTranslation,
    content: page.html ?? "",
});

export default function PageRoute() {
    const params = useParams();
    const slug = createMemo(() => String(params.page || ""));
    const page = createAsync(() => getPageBySlug(slug()));

    return (
        <Show keyed when={page()} fallback={<NotFound />}>
            {(p) => {
                const pageProps = toPageProps(p);
                const key = baseKeyFromSlug(String(p.slug || slug()));
                const body = () => (
                    <section class="md-content" innerHTML={p.html ?? ""} />
                );

                if (key === "archives")
                    return (
                        <Suspense fallback={body()}>
                            <Archives page={pageProps} />
                        </Suspense>
                    );
                if (key === "friends")
                    return (
                        <Suspense fallback={body()}>
                            <Friends page={pageProps}>{body()}</Friends>
                        </Suspense>
                    );
                if (key === "search")
                    return (
                        <Suspense fallback={body()}>
                            <Search page={pageProps}>{body()}</Search>
                        </Suspense>
                    );
                if (key === "life")
                    return (
                        <Suspense fallback={body()}>
                            <Life page={pageProps}>{body()}</Life>
                        </Suspense>
                    );

                return (
                    <ArticlePageLayout rawBlog={pageProps} relates={[]}>
                        {body()}
                    </ArticlePageLayout>
                );
            }}
        </Show>
    );
}
