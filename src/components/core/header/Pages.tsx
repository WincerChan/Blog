import { For } from "solid-js"
import { A } from "solid-start"
import { useI18nContext } from "~/i18n/i18n-solid"

type PagesProps = {
    rawPages: {
        slug: string,
        title: string
    }[]
}

const Pages = ({ rawPages }: PagesProps) => {
    const { LL, locale } = useI18nContext()
    const pages = rawPages.filter(x => x.slug !== 'search')
    console.log(locale())
    return (
        <ul class="flex overflow-x-scroll">
            <For each={pages}>
                {(pageEntry, idx) => (
                    <li>
                        <A inactiveClass="" href={`/${pageEntry.slug}/`} class=":: h-menu flex inline-block items-center bg-menuHover md:text-lg text-menuHover trans-linear capitalize min-w-14">{LL().header.NAV[idx()]()}</A>
                    </li>
                )}
            </For>
        </ul>
    )
}
export default Pages