import { Show } from "solid-js";
import IconPiggyBank from "~icons/carbon/piggy-bank";
import IconShare from "~icons/carbon/share";
import ToC from "~/features/article/components/ToC";
import SocialButton from "./social/Button";
import Like from "./social/Like";
import Translate from "./social/Translate";


interface SideBarProps {
    pageURL: string,
    lang?: string
}

const SideBar = ({ pageURL, lang }: SideBarProps) => {
    return (
        <aside class="">
            <div class="">
                <Like pageURL={pageURL} />
                <SocialButton
                    IconName={IconPiggyBank}
                    text="Reward"
                    kind="reward"
                    hoverColor="hover:text-amber-500 focus:text-amber-500"
                />
                <SocialButton
                    IconName={IconShare}
                    text="Share"
                    kind="share"
                    hoverColor="hover:text-sky-500 focus:text-sky-500"
                />
                <Show when={!!lang}>
                    <Translate pageURL={pageURL} lang={lang} />
                </Show>
            </div>
        </aside>
    )
}


export { ToC as BlogSideBar, SideBar };
