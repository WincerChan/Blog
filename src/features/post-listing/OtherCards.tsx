import { For, Show } from "solid-js";
import { useI18nContext } from "~/i18n/i18n-solid";
import PostMeta from "./PostMeta";
import type { PostListItem } from "./types";

type BlogProps = {
    blog: PostListItem,
}

const CompactBlog = ({ blog }: BlogProps) => {
    return (
        <div class="py-4 md:py-5 border-b border-[var(--c-border)]">
            <div class="flex flex-col gap-2 md:grid md:grid-cols-[minmax(0,1fr)_auto] md:items-start md:gap-x-6 md:gap-y-2">
                <div class="space-y-1">
                    <a link={true} href={blog.slug} class="block">
                        <h2 class="text-xl md:text-2xl font-semibold text-[var(--c-text)] hover:text-[var(--c-link)] transition-colors">
                            {blog.title}
                        </h2>
                    </a>
                    <Show when={blog.subtitle}>
                        <h3 class="text-base md:text-lg text-[var(--c-text-muted)] leading-relaxed">
                            {blog.subtitle}
                        </h3>
                    </Show>
                </div>
                <div class="md:text-right md:whitespace-nowrap">
                    <PostMeta date={blog.date} category={blog.category} />
                </div>
            </div>
        </div>
    )
}
type BlogCardsProps = {
    posts: () => PostListItem[],
    description?: string | null
    length?: number
}
const OtherBlogs = ({ posts, description, length }: BlogCardsProps) => {
    const { LL } = useI18nContext()
    const resolvedDescription = () => {
        if (description === null) return null;
        if (description !== undefined) return description;
        return LL && LL().archive.ARCHIVES_SUBTITLE({ total: posts().length });
    };
    return (
        <>
            <Show when={resolvedDescription() !== null}>
                <p class="text-sm text-[var(--c-text-muted)] mt-8 mb-4">
                    {resolvedDescription()}
                </p>
            </Show>
            <div class="divide-y divide-transparent">
                <For each={posts()}>
                    {
                        post => (
                            <CompactBlog blog={post} />
                        )
                    }
                </For>
            </div>
        </>
    )
}

export default OtherBlogs;
