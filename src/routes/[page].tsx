import { createAsync, useParams } from "@solidjs/router";
import { JSXElement, Show, Suspense, createEffect, createMemo, createSignal, lazy } from "solid-js";
import ArticlePage from "~/layouts/ArticlePage";
import SimplePageLayout from "~/layouts/SimplePageLayout";
import { VELITE_NOT_FOUND, getPageBySlug, pageUrl } from "~/content/velite";
import NotFound from "~/routes/[...all]";

const baseKeyFromSlug = (slug: string) => slug.replace(/-en$/, "");

const Archives = lazy(() => import("~/modules/archives/ArchivesPage"));
const Friends = lazy(() => import("~/modules/friends/FriendsPage"));
const Life = lazy(() => import("~/modules/life/LifePage"));
const Search = lazy(() => import("~/modules/search/SearchPage"));

type LayoutKind = "simple" | "article" | "article-no-comment";

const PAGE_COMPONENTS: Record<
    string,
    { Component: any; layout: LayoutKind; withChildren?: boolean }
> = {
    archives: { Component: Archives, layout: "simple" },
    friends: { Component: Friends, layout: "article", withChildren: true },
    search: { Component: Search, layout: "article-no-comment", withChildren: true },
    life: { Component: Life, layout: "article", withChildren: true },
};

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

const renderLayout = (layout: LayoutKind, pageProps: any, body: () => JSXElement) => {
    if (layout === "simple") {
        return (
            <SimplePageLayout page={pageProps} lang={pageProps.lang}>
                {body()}
            </SimplePageLayout>
        );
    }
    if (layout === "article-no-comment") {
        return (
            <ArticlePage rawBlog={pageProps} relates={[]} hideComment={true}>
                {body()}
            </ArticlePage>
        );
    }
    return (
        <ArticlePage rawBlog={pageProps} relates={[]}>
            {body()}
        </ArticlePage>
    );
};

const renderSpecialPage = (key: string, pageProps: any, body: () => JSXElement) => {
    const view = PAGE_COMPONENTS[key];
    if (!view) return null;
    const fallback = renderLayout(view.layout, pageProps, body);
    const content = view.withChildren ? (
        <view.Component page={pageProps}>{body()}</view.Component>
    ) : (
        <view.Component page={pageProps} />
    );
    return <Suspense fallback={fallback}>{content}</Suspense>;
};

export default function PageRoute() {
    const params = useParams();
    const slug = createMemo(() => String(params.page || ""));
    const page = createAsync(() => getPageBySlug(slug())) as any;
    const resolved = () => (import.meta.env.SSR ? page() : page.latest) as any;
    const [stale, setStale] = createSignal<any>();

    createEffect(() => {
        const v = resolved();
        if (!v || v === VELITE_NOT_FOUND) return;
        setStale(v);
    });

    const displayed = () => resolved() ?? stale();

    return (
        <Show keyed when={displayed()} fallback={<section class="md-content" />}>
            {(p) => {
                if (p === VELITE_NOT_FOUND) return <NotFound />;

                const pageProps = toPageProps(p);
                const key = baseKeyFromSlug(String(p.slug || slug()));
                const body = () => <section class="md-content" innerHTML={p.html ?? ""} />;

                const special = renderSpecialPage(key, pageProps, body);
                if (special) return special;

                return (
                    <ArticlePage rawBlog={pageProps} relates={[]}>
                        {body()}
                    </ArticlePage>
                );
            }}
        </Show>
    );
}
