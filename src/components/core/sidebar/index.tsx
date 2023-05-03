import Category from "./Category";
import Relates from "./Relates";
import Stats from "./Stats";
import Tags from "./Tags";
import ToC from "./ToC";
import { BlogPostParams } from "./types";

const SideBar = () => {
    return (
        <aside class="text-[15px] 2xl:col-span-13 col-span-14 <md:mx-4 <md:mt-8">
            <div class="sticky top-10">
                <Stats />
                <Category />
                <Tags />
            </div>
        </aside>
    )
}



const BlogSideBar = ({ blog }: { blog: BlogPostParams }) => {
    return (
        <aside class="text-[15px] 2xl:col-span-13 col-span-14">
            <div class="md:sticky top-10">
                <ToC {...blog} />
                <Relates relates={blog.relates} />
            </div>
        </aside>
    )
}

export { BlogSideBar, SideBar };
