import { Show } from "solid-js";
import ToC from "./ToC";
import SocialButton from "./social/Button";
import NavigateComment from "./social/Discussion";
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
            <div class={`:: top-[50vh] xl:top-[56vh] 2xl:top-[60vh] md:gap-4 flex lg:flex-col place-items-end place-content-around lg:mt-10 lg:sticky <sm:px-4 max-w-100vw overflow-x-scroll `}>
                <Like pageURL={pageURL} />
                <SocialButton lang={lang} iconName="i-carbon-piggy-bank" text="Reward" hoverColor="hover:text-amber-500 focus:text-amber-500" />
                <NavigateComment />
                <SocialButton lang={lang} iconName="i-carbon-share" text="Share" hoverColor="hover:text-sky-500 focus:text-sky-500" />
                <Show when={secondaryLang !== undefined}>
                    <Translate lang={lang} pageURL={pageURL} />
                </Show>
            </div>
        </aside>
    )
}


export { ToC as BlogSideBar, SideBar };
