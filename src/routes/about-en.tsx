import PostLayout from "~/components/layouts/PostLayout";
import { getPageBySlug, pageUrl } from "~/content/velite";
import NotFound from "~/routes/[...404]";

const About = () => {
    const page = getPageBySlug("about-en");
    if (!page) return <NotFound />;
    const rawBlog: any = {
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
        <PostLayout rawBlog={rawBlog} relates={[]}>
            <section innerHTML={page.html ?? ""} />
        </PostLayout>
    );
};

export default About;
