import { For } from "solid-js";
import { A } from "solid-start";
import LazyImg from "~/components/lazy/Img";
import { BlogMinimal } from "~/schema/Post";
import DateCat from "./DateCat";

type BlogProps = {
    blog: BlogMinimal,
}

const LatestBlog = ({ blog }: BlogProps) => {
    return (
        <>
            <div class="rounded lg:flex <lg:flex-col lg:space-x-6 mb-8">
                <A href={blog.slug} class="flex-none">
                    <LazyImg width={352} height={304} class="object-cover rounded h-coverMain w-coverMain" src={blog.cover} alt={`${blog.title}-cover`} />
                </A>
                <div class="flex flex-col <md:px-4 text-[15px] h-coverMain <lg:pt-4">
                    <A href={blog.slug}>
                        <h2 title={blog.title} class="lg:text-[1.7rem] text-[1.4rem] text-title font-headline font-medium !leading-relaxed">{blog.title}</h2>
                    </A>
                    {
                        blog.subtitle && (
                            <h3 class="lg:text-[1.4rem] text-subtitle text-xl font-headline font-medium leading-loose">{blog.subtitle}</h3>
                        )
                    }
                    <p class="text-base leading-7 <lg:text-[15px] relative <2xl:max-h-[140px] max-h-[168px] mt-2 text-justify overflow-hidden">
                        {blog.summary}
                    </p>
                    <div class="mt-auto leading-[1.3rem] py-3 justify-between text-[var(--extra)] flex text-[15px]">
                        <DateCat date={blog.date} category={blog.category} />
                        <A class="transition duration-200 ease-linear text-[var(--menu-hover-text)] hover:text-[var(--menu-hover-bg)] px-.5 text-link" href={blog.slug}>继续阅读</A>
                    </div>
                </div>
            </div>
        </>
    )
}

const CompactBlog = ({ blog }: BlogProps) => {
    return (
        <div class="text-[15px] mb-8 lg:space-y-5 <lg:flex">
            <A class="flex-none" href={blog.slug}>
                <LazyImg width={192} height={144} class="object-cover rounded h-28 lg:h-48 w-24 md:w-28 lg:w-full flex-none" src={blog.cover} alt={`${blog.title}-cover`} />
            </A>
            <div class="<lg:flex-col-reverse <lg:pl-4 <lg:flex md:space-y-2">
                <DateCat date={blog.date} category={blog.category} />
                <div class="flex-grow flex flex-col text-[15px] leading-relaxed">
                    <A href={blog.slug} class="mb-1">
                        <h2 class="text-lg font-headline max-h-14 leading-8 <lg:leading-relaxed">{blog.title}</h2>
                    </A>
                    {
                        blog.subtitle && (
                            <h3 class="text-base font-headline mt-1">{blog.subtitle}</h3>
                        )
                    }
                </div>
            </div>
        </div>
    )
}
type BlogCardsProps = {
    posts: BlogMinimal[],
    description?: string
}
const OtherBlogs = ({ posts, description }: BlogCardsProps) => {
    return (
        <>
            <p class="text-xl font-headline <md:mx-4 leading-loose mb-6 mt-4">{description ? description : `共计 ${posts.length} 篇文章`}</p>
            <div class="lg:grid grid-cols-3 gap-6 <md:mx-4">
                <For each={posts}>
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

export { LatestBlog, OtherBlogs };

