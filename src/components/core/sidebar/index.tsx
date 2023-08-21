import { HeadParamsTyoe } from "~/schema/Head";
import Like from "./social/Like";
import ToC from "./ToC";
import SocialButton from "./social/button";


const SideBar = ({ params }: { params: HeadParamsTyoe }) => {
    return (
        <aside class="lg:z-20 <lg:content-width <lg:mx-auto <md:mx-4">
            <div class=":: top-[66vh] 2xl:top-[70vh] grid gap-4 2xl:gap-7 lg:justify-items-end lg:mr-8 lg:mt-10 lg:sticky <lg:justify-between <lg:grid-cols-3 ">
                <Like pageURL={params.pageURL} />
                <SocialButton iconName="i-carbon-piggy-bank" text="Reward" hoverColor="text-amber-500" />
                <SocialButton iconName="i-carbon-share" text="Share" hoverColor="text-sky-500" />
            </div>
        </aside>
    )
}




export { ToC as BlogSideBar, SideBar };
