import LatestBlog from "~/features/home/LatestCard";
import OtherBlogs from "~/features/post-listing/OtherCards";
import PageLayout from "~/layouts/PageLayout";
import { getLatestPosts, postUrl } from "~/content/velite";
import { Show, createMemo, createResource } from "solid-js";
import IconArrowRight from "~icons/ph/arrow-right";



const Home = () => {
    const [latest] = createResource(() => 5, () => getLatestPosts(5));
    const recentPosts = createMemo(() =>
        (latest() ?? []).map((p) => ({
            ...p,
            slug: p.url ?? postUrl(String(p.slug)),
        })),
    );
    const date = () => recentPosts()[0]?.date;
    return (
        <PageLayout headParams={{ date: date() }}>
            <Show when={recentPosts()[0]}>
                {(first) => <LatestBlog blog={first() as any} />}
            </Show>
            <div class="mt-8 mb-4 flex items-end justify-between gap-4">
                <h3 class="text-base md:text-lg font-semibold text-[var(--c-text-subtle)]">近期文章</h3>
                <a
                    link={true}
                    class="group inline-flex items-center gap-1 text-sm font-medium text-[var(--c-text)] hover:text-[var(--c-link)] transition-colors"
                    href="/archives/"
                >
                    查看更多文章
                    <IconArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
            </div>
            <OtherBlogs posts={() => recentPosts().slice(1) as any} description={null} />
        </PageLayout>
    );
}


export default Home
