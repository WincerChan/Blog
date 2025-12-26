import { Show } from "solid-js";
import PostMeta from "~/features/post-listing/PostMeta";
import type { PostListItem } from "~/features/post-listing/types";
import IconPointFilled from "~icons/tabler/point-filled";
import IconArrowRight from "~icons/tabler/arrow-right";

type BlogProps = {
    blog: PostListItem,
}

const LatestBlog = ({ blog }: BlogProps) => {
    return (
        <>
            <div class="pt-10 md:pt-14 pb-12 border-b border-[var(--c-border)]">
                <div class="space-y-4">
                    <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
                        <span class="inline-flex items-center gap-1 text-sm uppercase tracking-wide font-mono text-[var(--c-accent)]">
                            <IconPointFilled width={12} height={12} class="latest-pulse" />
                            Latest
                        </span>
                        <PostMeta date={blog.date} category={blog.category} />
                    </div>
                    <a link={true} href={blog.slug} class="group block space-y-3">
                        <h2 title={blog.title} class="text-3xl md:text-4xl font-semibold tracking-tight leading-tight text-[var(--c-text)] group-hover:text-[var(--c-link)] transition-colors">
                            {blog.title}
                        </h2>
                        <Show when={blog.subtitle}>
                            <h3 title={blog.subtitle} class="text-xl md:text-2xl text-[var(--c-text-muted)] leading-relaxed">
                                {blog.subtitle}
                            </h3>
                        </Show>
                        <p class="text-[var(--c-text)] opacity-85 leading-relaxed max-w-2xl" innerText={blog.summary} />
                        <div class="flex items-center gap-4">
                            <span class="inline-flex items-center gap-1 text-sm text-[var(--c-text-muted)] underline decoration-1 underline-offset-4 decoration-[var(--c-border-strong)] group-hover:decoration-[var(--c-link)] transition-colors">
                                继续阅读
                                <IconArrowRight width={14} height={14} class="transition-transform group-hover:translate-x-1" />
                            </span>
                        </div>
                    </a>
                </div>
                <style>{`
                    @keyframes latest-pulse {
                        0% { transform: scale(1); opacity: 0.6; }
                        50% { transform: scale(1.15); opacity: 1; }
                        100% { transform: scale(1); opacity: 0.6; }
                    }
                    .latest-pulse {
                        animation: latest-pulse 2.4s ease-in-out infinite;
                    }
                `}</style>
            </div>
        </>
    )
}


export default LatestBlog
