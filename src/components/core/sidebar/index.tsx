import Category from "./Category";
import Stats from "./Stats";
import Tags from "./Tags";
import ToC from "./ToC";
import { BlogPostParams } from "./types";

const SideBar = () => {
    return (
        <aside class="text-[15px] aside-responsive">
            <div class=":: sticky top-10">
                <Stats />
                <Category />
                <Tags />
            </div>
        </aside>
    )
}



const BlogSideBar = ({ blog, slug }: { blog: BlogPostParams, slug: string }) => {
    return (
        <aside class=":: md:ml-8 max-w-80">
            <div class=":: top-10 md:sticky ">
                <ToC {...blog} slug={slug} />
                {/* <Relates relates={blog.relates} /> */}
            </div>
        </aside>
    )
}

export { BlogSideBar, SideBar };
