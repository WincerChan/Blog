import { For, Show } from "solid-js";
import { A } from "solid-start";
import LazyImg from "~/components/lazy/Img";
import { BlogMinimal } from "~/schema/Post";
import DateCat from "./DateCat";

type BlogProps = {
    blog: BlogMinimal,
}

const CompactBlog = ({ blog }: BlogProps) => {
    return (
        <div class=":: text-[15px] mb-8 lg:space-y-5 <lg:flex ">
            <A inactiveClass="" class="flex-none" href={blog.slug}>
                <LazyImg width={192} height={144} class=":: object-cover rounded h-28 w-24 flex-none md:w-28 lg:w-full lg:h-48 " src={blog.cover} alt={`${blog.title}-cover`} />
            </A>
            <div class=":: md:space-y-2 <lg:flex-col-reverse <lg:pl-4 <lg:flex ">
                <DateCat date={blog.date} category={blog.category} />
                <div class=":: flex-grow flex flex-col text-[15px] leading-relaxed ">
                    <A href={blog.slug} class="mb-1" inactiveClass="" activeClass="">
                        <h2 class=":: text-lg font-headline max-h-14 leading-8 <lg:leading-relaxed ">{blog.title}</h2>
                    </A>
                    <Show when={blog.subtitle}>
                        <h3 class=":: text-base font-headline mt-1 ">{blog.subtitle}</h3>
                    </Show>
                </div>
            </div>
        </div>
    )
}
type BlogCardsProps = {
    posts: () => BlogMinimal[],
    description?: string
}
const OtherBlogs = ({ posts, description }: BlogCardsProps) => {
    return (
        <>
            <p class=":: text-xl font-headline leading-loose mb-6 mt-4 <md:mx-4 ">{description ? description : `共计 ${posts().length} 篇文章`}</p>
            <div class="grid-cols-3 gap-6 <md:mx-4 lg:grid">
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

