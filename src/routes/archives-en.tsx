import Archives from "~/components/page/Archives";
import { getPageBySlug, pageUrl } from "~/content/velite";
import NotFound from "~/routes/[...404]";

const ArchivesPage = () => {
    const page = getPageBySlug("archives-en");
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
    };
    return <Archives page={pageProps} />;
};

export default ArchivesPage;
