import { Show } from "solid-js";
import DateCat from "~/features/post-listing/DateCat";
import type { PostListItem } from "~/features/post-listing/types";
import IconPointFilled from "~icons/tabler/point-filled";

type BlogProps = {
    blog: PostListItem,
}

const LatestBlog = ({ blog }: BlogProps) => {
    return (
        <>
            <div class="pt-10 md:pt-14 pb-12 border-b border-[var(--c-border)]">
                <div class="space-y-4 md:space-y-5">
                    <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
                        <span class="inline-flex items-center gap-1 text-xs uppercase tracking-wide text-[var(--c-accent)]">
                            <IconPointFilled width={12} height={12} class="latest-pulse" />
                            Latest
                        </span>
                        <DateCat date={blog.date} category={blog.category} />
                    </div>
                    <a link={true} href={blog.slug}>
                        <h2 title={blog.title} class="text-3xl md:text-4xl font-semibold tracking-tight leading-tight text-[var(--c-text)] hover:text-[var(--c-link)] transition-colors">
                            {blog.title}
                        </h2>
                    </a>
                    <Show when={blog.subtitle}>
                        <h3 title={blog.subtitle} class="text-lg md:text-xl text-[var(--c-text-muted)] leading-relaxed">
                            {blog.subtitle}
                        </h3>
                    </Show>
                    <p class="text-[var(--c-text-muted)] leading-relaxed max-w-2xl" innerText={blog.summary} />
                    <div class="flex items-center gap-4">
                        <a link={true} class="text-sm text-[var(--c-link)] hover:text-[var(--c-link-hover)] transition-colors" href={blog.slug}>
                            继续阅读 »
                        </a>
                    </div>
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
