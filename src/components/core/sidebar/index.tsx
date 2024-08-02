import { Accessor, Show } from "solid-js";
import { Translations } from "~/i18n/i18n-types";
import IconPiggyBank from "~icons/carbon/piggy-bank";
import IconShare from "~icons/carbon/share";
import ToC from "./ToC";
import SocialButton from "./social/Button";
import Like from "./social/Like";
import Translate from "./social/Translate";


interface SideBarProps {
    pageURL: string,
    lang?: string,
    LL?: Accessor<Translations>,
    isTranslation?: boolean
}

const SideBar = ({ pageURL, LL, isTranslation, lang }: SideBarProps) => {
    return (
        <aside class=":: lg:z-20 <md:w-full <lg:content-width <lg:mx-auto ">
            <div class={`:: top-[50vh] xl:top-[54vh] 2xl:top-[60vh] md:gap-4 flex lg:flex-col place-items-end place-content-around lg:mt-10 lg:sticky <sm:px-4 max-w-100vw `}>
                <Like pageURL={pageURL} />
                <SocialButton LL={LL} IconName={IconPiggyBank} text="Reward" hoverColor="hover:text-amber-500 focus:text-amber-500" lang={lang} />
                <SocialButton LL={LL} IconName={IconShare} text="Share" hoverColor="hover:text-sky-500 focus:text-sky-500" lang={lang} />
                <Show when={isTranslation !== undefined}>
                    <Translate LL={LL} pageURL={pageURL} lang={lang} />
                </Show>
            </div>
        </aside>
    )
}


export { ToC as BlogSideBar, SideBar };
