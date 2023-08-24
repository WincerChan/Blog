import { For } from "solid-js"
import { A } from "solid-start"
import { val } from "./ThemeSwitch/Provider"

type PagesProps = {
    rawPages: {
        slug: string,
        title: string
    }[]
}

const Pages = ({ rawPages }: PagesProps) => {
    const pages = rawPages.filter(x => x.slug !== 'search')
    return (
        <ul class="flex overflow-x-scroll">
            <For each={pages}>
                {(pageEntry, idx) => (
                    <li>
                        <A inactiveClass="" href={`/${pageEntry.slug}/`} class=":: h-menu flex inline-block items-center bg-menuHover md:text-lg text-menuHover trans-linear capitalize min-w-14">{val.lang == 'zh-CN' ? pageEntry.title : pageEntry.slug}</A>
                    </li>
                )}
            </For>
        </ul>
    )
}
export default Pages