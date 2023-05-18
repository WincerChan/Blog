import { Show } from "solid-js";
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
            <div class="rounded lg:grid lg:grid-cols-10 lg:space-x-6 mb-8">
                <A href={blog.slug} inactiveClass="" class="w-full block lg:col-span-4">
                    <LazyImg width={352} height={304} class=":: object-cover rounded h-coverMain w-full" src={blog.cover} alt={`${blog.title}-cover`} />
                </A>
                <div class="<md:px-4 flex flex-col text-[15px] h-coverMain <lg:pt-4 lg:col-span-6">
                    <A link={true} inactiveClass="" href={blog.slug}>
                        <h2 title={blog.title} class=":: lg:text-[1.8rem] text-[1.45rem] text-title font-headline font-medium !leading-relaxed ">{blog.title}</h2>
                    </A>
                    <Show when={blog.subtitle}>
                        <h3 title={blog.subtitle} class="lg:text-[1.45rem] mt-1 flex-none truncate text-subtitle text-xl font-headline font-medium leading-loose">{blog.subtitle}</h3>
                    </Show>
                    <p class=":: text-base leading-loose relative mt-2 text-justify overflow-hidden " innerText={blog.summary} />
                    <div class=":: mt-auto leading-[1.4] py-3 justify-between text-[var(--extra)] flex text-[15px] ">
                        <DateCat date={blog.date} category={blog.category} />
                        <A class=":: transition duration-200 ease-linear text-[var(--menu-hover-text)] hover:text-[var(--menu-hover-bg)] px-.5 text-link " inactiveClass="" href={blog.slug}>继续阅读</A>
                    </div>
                </div>
            </div>
        </>
    )
}


export default LatestBlog