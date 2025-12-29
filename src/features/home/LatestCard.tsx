import { Show } from "solid-js";
import PostMeta from "~/features/post-listing/PostMeta";
import type { PostListItem } from "~/features/post-listing/types";
import IconPointFilled from "~icons/ph/dot-duotone";
import IconArrowRight from "~icons/ph/arrow-right";

type BlogProps = {
    blog: PostListItem,
}

const LatestBlog = ({ blog }: BlogProps) => {
    return (
        <>
            <div class="pt-10 md:pt-14 pb-12 border-b border-[var(--c-border)]">
                <div class="space-y-4">
                    <div class="flex flex-wrap items-center gap-x-4">
                        <span class="inline-flex items-center gap-1 overflow-visible text-sm uppercase tracking-wide font-mono text-[var(--c-accent)]">
                            <IconPointFilled width={18} height={18} class="animate-pulse scale-200 origin-center" />
                            Latest
                        </span>
                        <PostMeta date={blog.date} category={blog.category} />
                    </div>
                    <a link={true} href={blog.slug} class="group block space-y-4">
                        <h2 title={blog.title} class="text-3xl md:text-4xl font-semibold font-serif tracking-tight leading-tight text-[var(--c-text)] decoration-[color-mix(in_srgb,var(--c-link)_70%,transparent)] decoration-2 underline-offset-6 group-hover:underline">
                            {blog.title}
                        </h2>
                        <Show when={blog.subtitle}>
                            <h3 title={blog.subtitle} class="text-xl md:text-2xl font-semibold text-[var(--c-text-muted)] leading-relaxed font-serif">
                                {blog.subtitle}
                            </h3>
                        </Show>
                        <p class="text-[var(--c-text)] opacity-85 leading-[1.75]" innerText={blog.summary} />
                        <div class="flex items-center gap-4">
                            <span class="latest-readmore inline-flex items-center gap-1 text-sm font-medium text-[var(--c-text)] transition-colors hover:text-[var(--c-link)]">
                                继续阅读
                                <IconArrowRight width={14} height={14} class="latest-readmore-arrow transition-transform" />
                            </span>
                        </div>
                    </a>
                </div>
            </div>
        </>
    )
}


export default LatestBlog
