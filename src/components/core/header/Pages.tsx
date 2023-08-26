import { For, createMemo } from "solid-js"
import { isServer } from "solid-js/web"
import { A } from "solid-start"
import { useI18nContext } from "~/i18n/i18n-solid"

type PagesProps = {
    rawPages: {
        slug: string,
        title: string
    }[]
}

const Pages = () => {
    const { LL, locale } = useI18nContext()
    let pages;
    if (isServer) {
        if (locale() === 'zh-CN') pages = () => (__ZH_NAV)
        if (locale() === "en") pages = () => (__EN_NAV)
    } else {
        pages = createMemo(() => {
            if (locale() === 'zh-CN') return __ZH_NAV
            if (locale() === "en") return __EN_NAV
        })
    }
    return (
        <ul class="flex overflow-x-scroll">
            <For each={pages()}>
                {(pageEntry, idx) => (
                    <li>
                        <A inactiveClass="" href={`/${pageEntry}/`} class=":: h-menu flex inline-block items-center bg-menuHover md:text-lg text-menuHover trans-linear capitalize min-w-14">{LL().header.NAV[idx()]()}</A>
                    </li>
                )}
            </For>
        </ul>
    )
}
export default Pages