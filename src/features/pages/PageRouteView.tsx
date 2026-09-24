import { Accessor, Element, Show, Loading, createMemo } from "solid-js";
import ArticlePage, { ArticleNotFound } from "~/layouts/ArticlePage";
import SimplePageLayout from "~/layouts/SimplePageLayout";
import { getPageBySlug, pageUrl } from "~/content/velite";

type LayoutKind = "simple" | "article" | "article-no-comment";
type PageView = (props: { page: any; children?: Element }) => Element;

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
    inkstoneToken: page.inkstoneToken,
});

const renderLayout = (layout: LayoutKind, pageProps: any, body: () => Element) => {
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
    const page = createMemo(async () => getPageBySlug(slug()));
    const resolved = () => page() as any;
    const displayed = resolved;

    return (
        <Show keyed when={displayed()} fallback={<section class="" />}>
            {(p) => {
                if ("__veliteNotFound" in p) return <ArticleNotFound />;

                const pageProps = toPageProps(p);
                const body = () => <section class="" innerHTML={p.html ?? ""} />;
                if (!view) return renderLayout(layout, pageProps, body);

                const View = view;
                const content = withChildren ? (
                    <View page={pageProps}>{body()}</View>
                ) : (
                    <View page={pageProps} />
                );
                return <Loading fallback={renderLayout(layout, pageProps, body)}>{content}</Loading>;
            }}
        </Show>
    );
};

export default PageRouteView;
