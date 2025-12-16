import Search from "~/components/page/Search";
import { getPageBySlug, pageUrl } from "~/content/velite";
import NotFound from "~/routes/[...404]";

const SearchPage = () => {
    const page = getPageBySlug("search");
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
    return (
        <Search page={pageProps}>
            <section innerHTML={page.html ?? ""} />
        </Search>
    );
};

export default SearchPage;

