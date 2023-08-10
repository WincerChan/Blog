import Category from "./Category";
import Stats from "./Stats";
import Tags from "./Tags";
import ToC from "./ToC";

const SideBar = () => {
    return (
        <aside class=":: text-[15px] aside-responsive">
            <div class=":: sticky top-10">
                <Stats />
                <Category />
                <Tags />
            </div>
        </aside>
    )
}




export { ToC as BlogSideBar, SideBar };
