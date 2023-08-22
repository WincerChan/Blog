import { For } from "solid-js"
import { A } from "solid-start"

type PagesProps = {
    rawPages: {
        slug: string,
        title: string
    }[]
}

const Pages = ({ rawPages }: PagesProps) => {
    const pages = rawPages.filter(x => x.slug !== 'search')
    return (
        <ul class="flex ml-4">
            <For each={pages}>
                {pageEntry => (
                    <li>
                        <A inactiveClass="" href={`/${pageEntry.slug}/`} class=":: h-menu flex inline-block items-center bg-menuHover md:text-lg text-menuHover trans-linear capitalize">{pageEntry.title}</A>
                    </li>
                )}
            </For>
        </ul>
    )
}
export default Pages