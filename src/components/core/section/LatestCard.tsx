import { Show } from "solid-js";
import { A } from "solid-start";
import { BlogMinimal } from "~/schema/Post";
import DateCat from "./DateCat";

type BlogProps = {
    blog: BlogMinimal,
}

const LatestBlog = ({ blog }: BlogProps) => {
    return (
        <>
            <div class=":: rounded flex flex-row mb-12 lg:space-x-10 <lg:flex-col-reverse ">
                <div class=":: <lg:mt-3 flex flex-col lg:basis-1/2 h-coverMain ">
                    <A link={true} inactiveClass="" href={blog.slug}>
                        <h2 title={blog.title} class=":: lg:text-4xl text-3xl text-title font-headline font-medium !leading-loose ">{blog.title}</h2>
                    </A>
                    <Show when={blog.subtitle}>
                        <h3 title={blog.subtitle} class=":: lg:text-3xl mt-1 flex-none truncate text-subtitle text-2xl font-headline font-medium !leading-relaxed ">{blog.subtitle}</h3>
                    </Show>
                    <p class=":: text-lg leading-loose relative my-2 text-justify overflow-hidden " innerText={blog.summary} />
                    <div class=":: mt-auto leading-[1.4] py-2 justify-between text-[var(--extra)] flex text-base ">
                        <DateCat date={blog.date} category={blog.category} />
                        <A class=":: transition duration-200 ease-linear text-[var(--menu-hover-text)] hover:text-[var(--menu-hover-bg)] px-.5 text-link " inactiveClass="" href={blog.slug}>继续阅读 »</A>
                    </div>
                </div>
                <img width={352} height={304} class=":: lg:basis-1/2 block object-cover rounded h-coverMain w-full !mobile-width-beyond " src={blog.cover} alt={`${blog.title}-cover`} />
            </div>
        </>
    )
}


export default LatestBlog