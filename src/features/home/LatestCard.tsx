import { Show } from "solid-js";
import DateCat from "~/features/post-listing/DateCat";
import type { PostListItem } from "~/features/post-listing/types";

type BlogProps = {
    blog: PostListItem,
}

const LatestBlog = ({ blog }: BlogProps) => {
    return (
        <>
            <div class="">
                <div class="">
                    <a link={true} href={blog.slug}>
                        <h2 title={blog.title} class="">{blog.title}</h2>
                    </a>
                    <Show when={blog.subtitle}>
                        <h3 title={blog.subtitle} class="">{blog.subtitle}</h3>
                    </Show>
                    <p class="" innerText={blog.summary} />
                    <div class="">
                        <DateCat date={blog.date} category={blog.category} />
                        <a link={true} class="" href={blog.slug}>继续阅读 »</a>
                    </div>
                </div>
                <img width={352} height={304} class="" src={blog.cover} alt={`${blog.title}-cover`} />
            </div>
        </>
    )
}


export default LatestBlog
