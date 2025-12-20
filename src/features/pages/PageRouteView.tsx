import { createAsync } from "@solidjs/router";
import { Accessor, JSXElement, Show, Suspense, createEffect, createSignal } from "solid-js";
import ArticlePage from "~/layouts/ArticlePage";
import SimplePageLayout from "~/layouts/SimplePageLayout";
import { VELITE_NOT_FOUND, getPageBySlug, pageUrl } from "~/content/velite";
import NotFound from "~/routes/[...all]";

type LayoutKind = "simple" | "article" | "article-no-comment";
type PageView = (props: { page: any; children?: JSXElement }) => JSXElement;

type PageRouteViewProps = {
    slug: Accessor<string>;
    view?: PageView;
    layout?: LayoutKind;
    withChildren?: boolean;
};

const toPageProps = (page: any) => ({
    slug: pageUrl(page.slug),
    title: page.title,
    date: page.date,
    updated: page.updated ?? page.date,
    cover: page.cover ?? "",
    summary: page.summary,
    toc: "",
    category: "",
    tags: [],
    words: 0,
    neighbours: {},
    lang: page.lang,
    isTranslation: page.isTranslation,
    content: page.html ?? "",
    hasLegacyComments: page.hasLegacyComments ?? false,
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

const PageRouteView = ({ slug, view, layout = "article", withChildren }: PageRouteViewProps) => {
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
                const body = () => <section class="md-content" innerHTML={p.html ?? ""} />;
                if (!view) return renderLayout(layout, pageProps, body);

                const View = view;
                const content = withChildren ? (
                    <View page={pageProps}>{body()}</View>
                ) : (
                    <View page={pageProps} />
                );
                return <Suspense fallback={renderLayout(layout, pageProps, body)}>{content}</Suspense>;
            }}
        </Show>
    );
};

export default PageRouteView;
