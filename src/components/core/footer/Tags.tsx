import { A } from "@solidjs/router";
import { For } from "solid-js";
import { useI18nContext } from "~/i18n/i18n-solid";

const Tags = () => {
    const { LL, locale } = useI18nContext()
    return (
        <div class="<md:hidden">
            <label class=":: font-headline text-[var(--subtitle)]">{LL().footer.T()}</label>
            <div class=":: flex-wrap gap-x-3 flex justify-between ">
                <For each={__TAGS}>
                    {
                        tag => (
                            <A href={`/tags/${tag}/`} inactiveClass="" class="text-menuHover">
                                <span class="text-menuActive">#</span>{tag}
                            </A>
                        )
                    }
                </For>
            </div>
        </div>
    )
}
export default Tags