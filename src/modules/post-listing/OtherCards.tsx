import { For, Show } from "solid-js";
import { useI18nContext } from "~/i18n/i18n-solid";
import DateCat from "./DateCat";
import type { PostListItem } from "./types";

type BlogProps = {
    blog: PostListItem,
}

const CompactBlog = ({ blog }: BlogProps) => {
    return (
        <div class=":: text-base mb-8 lg:space-y-5 ">
            <div class=":: md:space-y-2 mb-2 ">
                <div class=":: flex-grow flex flex-col leading-relaxed ">
                    <a link={true} href={blog.slug} class="mb-1">
                        <h2 class=":: text-headline ">{blog.title}</h2>
                    </a>
                    <Show when={blog.subtitle}>
                        <h3 class=":: text-2xl font-semibold font-headline mb-2 ">{blog.subtitle}</h3>
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
                <p class=":: md:text-2xl text-xl font-headline font-semibold leading-loose md:my-4 my-2 ">
                    {resolvedDescription()}
                </p>
            </Show>
            <div class="grid-cols-2 lg:gap-8 lg:grid ">
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
