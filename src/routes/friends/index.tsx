import Friends from "~/components/page/Friends";
import { getPageBySlug, pageUrl } from "~/content/velite";
import NotFound from "~/routes/[...404]";

const FriendsPage = () => {
    const page = getPageBySlug("friends");
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
        <Friends page={pageProps}>
            <section innerHTML={page.html ?? ""} />
        </Friends>
    );
};

export default FriendsPage;

