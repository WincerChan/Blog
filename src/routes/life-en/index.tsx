import Life from "~/components/page/Life";
import { getPageBySlug, pageUrl } from "~/content/velite";
import NotFound from "~/routes/[...404]";

const LifePage = () => {
    const page = getPageBySlug("life-en");
    if (!page) return <NotFound />;
    const pageProps: any = {
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
    };
    return (
        <Life page={pageProps}>
            <section innerHTML={page.html ?? ""} />
        </Life>
    );
};

export default LifePage;

