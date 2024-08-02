import { Accessor, For, JSXElement } from "solid-js";
import { Translations } from "~/i18n/i18n-types";
import NotByAi from "~/svgs/not-by-ai";
import { formatDate } from "~/utils";


interface CopyrightProps {
    title: string,
    slug: string,
    updated: Date,
    LL: Accessor<Translations>
}

const Copyright = ({ title, slug, updated, LL }: CopyrightProps) => {
    const elems: JSXElement[] = [
        "Wincer",
        formatDate(updated),
        <a href="https://creativecommons.org/licenses/by-nc-nd/4.0/deed.zh" class="hover:text-menu-transition" target="_blank" rel="noopener">
            CC BY-NC-ND 4.0
        </a>
    ];
    return (
        <div class=":: overflow-hidden p-4 px-6 bg-[var(--copyright-bg)] relative leading-7 my-8 font-headline <md:px-4 mobile-width-beyond ">
            <div>
                <p>{title}</p>
                <p>{`${__SITE_CONF.baseURL}${slug}`}</p>
            </div>
            <div class=":: flex mt-4 flex-wrap items-center gap-x-8 ">
                <For each={elems}>
                    {(elem, idx) => (
                        <div class="w-36">
                            <p>{LL && LL().post.COPYRIGHT[idx() as 0 | 1 | 2]}</p>
                            {elem}
                        </div>
                    )}
                </For>
            </div>
            <a href="https://notbyai.fyi/" aria-label="not-by-ai" target="_blank" class=":: absolute opacity-60 bottom-6 right-6 ml-auto text-[var(--cc)] ">
                <NotByAi />
            </a>
        </div>
    )
}

export default Copyright;