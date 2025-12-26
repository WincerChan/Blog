import { Accessor, For, JSXElement } from "solid-js";
import { Translations } from "~/i18n/i18n-types";
import NotByAi from "~/ui/icons/not-by-ai";
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
        <a href="https://creativecommons.org/licenses/by-nc-nd/4.0/deed.zh" class="" target="_blank" rel="noopener">
            CC BY-NC-ND 4.0
        </a>
    ];
    return (
        <div class="">
            <div>
                <p>{title}</p>
                <p>{`${__SITE_CONF.baseURL}${slug}`}</p>
            </div>
            <div class="">
                <For each={elems}>
                    {(elem, idx) => (
                        <div class="">
                            <p>{LL && LL().post.COPYRIGHT[idx() as 0 | 1 | 2]}</p>
                            {elem}
                        </div>
                    )}
                </For>
            </div>
            <a href="https://notbyai.fyi/" aria-label="not-by-ai" target="_blank" class="">
                <NotByAi />
            </a>
        </div>
    )
}

export default Copyright;
