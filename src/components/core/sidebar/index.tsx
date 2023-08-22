import { Show } from "solid-js";
import ToC from "./ToC";
import SocialButton from "./social/Button";
import Like from "./social/Like";
import Translate from "./social/Translate";


interface SideBarProps {
    pageURL: string,
    lang?: string,
    secondaryLang?: boolean
}

const SideBar = ({ pageURL, lang, secondaryLang }: SideBarProps) => {
    return (
        <aside class=":: lg:z-20 <md:w-full <lg:content-width <lg:mx-auto ">
            <div class={`:: top-[66vh] 2xl:top-[70vh] grid md:gap-5 2xl:gap-7 lg:justify-items-end lg:mr-8 lg:mt-10 lg:sticky ${!secondaryLang ? ' grid-cols-3' : 'grid-cols-4'} `}>
                <Like pageURL={pageURL} />
                <SocialButton lang={lang} iconName="i-carbon-piggy-bank" text="Reward" hoverColor="text-amber-500" />
                <SocialButton lang={lang} iconName="i-carbon-share" text="Share" hoverColor="text-sky-500" />
                <Show when={secondaryLang !== undefined}>
                    <Translate lang={lang} pageURL={pageURL} />
                </Show>
            </div>
        </aside>
    )
}




export { ToC as BlogSideBar, SideBar };
