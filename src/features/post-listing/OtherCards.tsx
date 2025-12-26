import { For, Show } from "solid-js";
import { useI18nContext } from "~/i18n/i18n-solid";
import DateCat from "./DateCat";
import type { PostListItem } from "./types";

type BlogProps = {
    blog: PostListItem,
}

const CompactBlog = ({ blog }: BlogProps) => {
    return (
        <div class="">
            <div class="">
                <div class="">
                    <a link={true} href={blog.slug} class="">
                        <h2 class="">{blog.title}</h2>
                    </a>
                    <Show when={blog.subtitle}>
                        <h3 class="">{blog.subtitle}</h3>
                    </Show>
                </div>
                <DateCat date={blog.date} category={blog.category} />
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
                <p class="">
                    {resolvedDescription()}
                </p>
            </Show>
            <div class="">
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
