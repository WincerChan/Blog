import { Show } from "solid-js";
import DateCat from "~/features/post-listing/DateCat";
import type { PostListItem } from "~/features/post-listing/types";

type BlogProps = {
    blog: PostListItem,
}

const LatestBlog = ({ blog }: BlogProps) => {
    return (
        <>
            <div class="pt-10 md:pt-14 pb-12 border-b border-[var(--c-border)]">
                <div class="space-y-4 md:space-y-5">
                    <DateCat date={blog.date} category={blog.category} />
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
            </div>
        </>
    )
}


export default LatestBlog
