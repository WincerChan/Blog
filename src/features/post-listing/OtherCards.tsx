import { For, Show } from "solid-js";
import { useI18nContext } from "~/i18n/i18n-solid";
import PostMeta from "./PostMeta";
import type { PostListItem } from "./types";

type BlogProps = {
    blog: PostListItem,
}

const CompactBlog = ({ blog }: BlogProps) => {
    return (
        <div class="py-4 md:py-5">
            <div class="flex flex-col gap-2 md:grid md:grid-cols-[minmax(0,1fr)_auto] md:items-start md:gap-x-6 md:gap-y-2">
                <a link={true} href={blog.slug} class="group block space-y-1">
                    <h2 class="text-xl md:text-2xl font-medium text-[var(--c-text)] decoration-[var(--c-text)] decoration-1.5 underline-offset-6 group-hover:underline">
                        {blog.title}
                    </h2>
                    <Show when={blog.subtitle}>
                        <h3 class="text-base md:text-lg text-[var(--c-text-muted)] mt-1 leading-relaxed">
                            {blog.subtitle}
                        </h3>
                    </Show>
                </a>
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
            <div>
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
