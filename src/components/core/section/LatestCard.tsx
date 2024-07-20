import { Show } from "solid-js";
import { BlogMinimal } from "~/schema/Post";
import DateCat from "./DateCat";

type BlogProps = {
    blog: BlogMinimal,
}

const LatestBlog = ({ blog }: BlogProps) => {
    return (
        <>
            <div class=":: rounded flex lg:flex-row mb-12 lg:gap-x-10 gap-y-4 flex-col-reverse xl:h-80 lg:h-78 ">
                <div class=":: lg:basis-1/2 flex flex-col md:h-70 sm:h-76 lg:h-78 xl:h-80 h-85 ">
                    <a link={true} href={blog.slug}>
                        <h2 title={blog.title} class=":: text-headline ">{blog.title}</h2>
                    </a>
                    <Show when={blog.subtitle}>
                        <h3 title={blog.subtitle} class=":: font-semibold text-2xl mt-1 flex-none truncate text-subtitle font-headline font-medium !leading-relaxed ">{blog.subtitle}</h3>
                    </Show>
                    <p class=":: text-lg leading-loose relative sm:my-2 my-1 text-justify overflow-hidden " innerText={blog.summary} />
                    <div class=":: mt-auto justify-between text-[var(--extra)] flex ">
                        <DateCat date={blog.date} category={blog.category} />
                        <a class=":: transition duration-200 ease-linear text-[var(--menu-hover-text)] hover:text-[var(--menu-hover-bg)] text-link leading-tight " href={blog.slug}>继续阅读 »</a>
                    </div>
                </div>
                <img width={352} height={304} class=":: lg:basis-1/2 lg:max-w-1/2 xl:h-80 lg:h-78 h-82 block object-cover rounded w-full !mobile-width-beyond " src={blog.cover} alt={`${blog.title}-cover`} />
            </div>
        </>
    )
}


export default LatestBlog