import Category from "./Category";
import Relates from "./Relates";
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



const BlogSideBar = ({ blog }: { blog: BlogPostParams }) => {
    return (
        <aside class=":: text-[15px] col-span-14 2xl:col-span-13 ">
            <div class=":: top-10 md:sticky ">
                <ToC {...blog} />
                <Relates relates={blog.relates} />
            </div>
        </aside>
    )
}

export { BlogSideBar, SideBar };
