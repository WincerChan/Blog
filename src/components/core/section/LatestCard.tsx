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
                    <LazyImg width={352} height={304} class=":: object-cover rounded h-coverMain w-coverMain " src={blog.cover} alt={`${blog.title}-cover`} />
                </A>
                <div class="flex flex-col <md:px-4 text-[15px] h-coverMain <lg:pt-4">
                    <A link={true} href={blog.slug}>
                        <h2 title={blog.title} class=":: lg:text-[1.7rem] text-[1.4rem] text-title font-headline font-medium !leading-relaxed ">{blog.title}</h2>
                    </A>
                    {
                        blog.subtitle && (
                            <h3 class="lg:text-[1.4rem] text-subtitle text-xl font-headline font-medium leading-loose">{blog.subtitle}</h3>
                        )
                    }
                    <p class=":: text-base leading-7 relative mt-2 text-justify overflow-hidden max-h-[168px] <lg:text-[15px] <2xl:max-h-[140px] ">
                        {blog.summary}
                    </p>
                    <div class=":: mt-auto leading-[1.3rem] py-3 justify-between text-[var(--extra)] flex text-[15px] ">
                        <DateCat date={blog.date} category={blog.category} />
                        <A class=":: transition duration-200 ease-linear text-[var(--menu-hover-text)] hover:text-[var(--menu-hover-bg)] px-.5 text-link " href={blog.slug}>继续阅读</A>
                    </div>
                </div>
            </div>
        </>
    )
}


export default LatestBlog