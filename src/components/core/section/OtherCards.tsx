import { For, Show } from "solid-js";
import { A } from "solid-start";
import { useI18nContext } from "~/i18n/i18n-solid";
import { BlogMinimal } from "~/schema/Post";
import DateCat from "./DateCat";

type BlogProps = {
    blog: BlogMinimal,
}

const CompactBlog = ({ blog }: BlogProps) => {
    return (
        <div class=":: text-base mb-8 lg:space-y-5 ">
            <div class=":: md:space-y-2 mb-2 ">
                <div class=":: flex-grow flex flex-col leading-relaxed ">
                    <A href={blog.slug} class="mb-1" inactiveClass="" activeClass="">
                        <h2 class=":: text-3xl <lg:text-2xl leading-loose font-headline leading-8 <lg:leading-relaxed ">{blog.title}</h2>
                    </A>
                    <Show when={blog.subtitle}>
                        <h3 class=":: text-2xl <lg:text-[1.35rem] font-headline mb-2 ">{blog.subtitle}</h3>
                    </Show>
                </div>
                <DateCat date={blog.date} category={blog.category} />
            </div>
        </div>
    )
}
type BlogCardsProps = {
    posts: () => BlogMinimal[],
    description?: string
    length?: number
}
const OtherBlogs = ({ posts, description, length }: BlogCardsProps) => {
    const { LL } = useI18nContext()
    return (
        <>
            <p class=":: lg:text-3xl text-[1.6rem] font-headline leading-loose my-6 ">{description ?? LL().archive.SUBTITLE({ total: posts().length })}</p>
            <div class="grid-cols-2 gap-8 lg:grid">
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

