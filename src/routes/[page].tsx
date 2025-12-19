import { createAsync, useParams } from "@solidjs/router";
import { Show, Suspense, createEffect, createMemo, createSignal, lazy } from "solid-js";
import ArticlePage from "~/layouts/ArticlePage";
import SimplePageLayout from "~/layouts/SimplePageLayout";
import { VELITE_NOT_FOUND, getPageBySlug, pageUrl } from "~/content/velite";
import NotFound from "~/routes/[...all]";

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
                const fallbackLayout = () => {
                    if (key === "archives") {
                        return (
                            <SimplePageLayout page={pageProps} lang={pageProps.lang}>
                                {body()}
                            </SimplePageLayout>
                        );
                    }
                    if (key === "search") {
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

                if (key === "archives")
                    return (
                        <Suspense fallback={fallbackLayout()}>
                            <Archives page={pageProps} />
                        </Suspense>
                    );
                if (key === "friends")
                    return (
                        <Suspense fallback={fallbackLayout()}>
                            <Friends page={pageProps}>{body()}</Friends>
                        </Suspense>
                    );
                if (key === "search")
                    return (
                        <Suspense fallback={fallbackLayout()}>
                            <Search page={pageProps}>{body()}</Search>
                        </Suspense>
                    );
                if (key === "life")
                    return (
                        <Suspense fallback={fallbackLayout()}>
                            <Life page={pageProps}>{body()}</Life>
                        </Suspense>
                    );

                return (
                    <ArticlePage rawBlog={pageProps} relates={[]}>
                        {body()}
                    </ArticlePage>
                );
            }}
        </Show>
    );
}
