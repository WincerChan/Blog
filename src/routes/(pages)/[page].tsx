import { useParams } from "@solidjs/router";
import { Show, createMemo } from "solid-js";
import ArticlePageLayout from "~/modules/article/layout/ArticlePageLayout";
import Archives from "~/modules/archives/ArchivesPage";
import Friends from "~/modules/friends/FriendsPage";
import Life from "~/modules/life/LifePage";
import Search from "~/modules/search/SearchPage";
import { getPageBySlug, pageUrl } from "~/content/velite";
import NotFound from "~/routes/[...404]";

const baseKeyFromSlug = (slug: string) => slug.replace(/-en$/, "");

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
    const page = createMemo(() => (slug() ? getPageBySlug(slug()) : undefined));

    return (
        <Show keyed when={page()} fallback={<NotFound />}>
            {(p) => {
                const pageProps = toPageProps(p);
                const key = baseKeyFromSlug(String(p.slug || slug()));
                const body = () => <section class="md-content" innerHTML={p.html ?? ""} />;

                if (key === "archives") return <Archives page={pageProps} />;
                if (key === "friends")
                    return <Friends page={pageProps}>{body()}</Friends>;
                if (key === "search") return <Search page={pageProps}>{body()}</Search>;
                if (key === "life") return <Life page={pageProps}>{body()}</Life>;

                return (
                    <ArticlePageLayout rawBlog={pageProps} relates={[]}>
                        {body()}
                    </ArticlePageLayout>
                );
            }}
        </Show>
    );
}
