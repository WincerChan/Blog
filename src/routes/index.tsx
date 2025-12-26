import LatestBlog from "~/features/home/LatestCard";
import OtherBlogs from "~/features/post-listing/OtherCards";
import PageLayout from "~/layouts/PageLayout";
import { getLatestPosts, postUrl } from "~/content/velite";
import { Show, createMemo, createResource } from "solid-js";



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
                <h3 class="text-sm text-[var(--c-text-muted)]">近期文章</h3>
                <a
                    link={true}
                    class="inline-flex items-center gap-1 text-sm text-[var(--c-text-muted)] underline decoration-1 underline-offset-4 decoration-[var(--c-border-strong)] hover:decoration-[var(--c-link)] transition-colors"
                    href="/archives/"
                >
                    查看更多文章
                </a>
            </div>
            <OtherBlogs posts={() => recentPosts().slice(1) as any} description={null} />
        </PageLayout>
    );
}


export default Home
