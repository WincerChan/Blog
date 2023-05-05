import { For } from "solid-js"
import { A } from "solid-start"

type PagesProps = {
    pages: {
        slug: string,
        title: string
    }[]
}

const Pages = ({ pages }: PagesProps) => {
    return (
        <ul class="flex">
            <For each={pages.filter(x => x.slug !== 'search')}>
                {pageEntry => (
                    <li >
                        <A inactiveClass="" href={`/${pageEntry.slug}/`} class=":: h-menu flex inline-block items-center bg-menuHover text-menuHover trans-linear">{pageEntry.title}</A>
                    </li>
                )}
            </For>
        </ul>
    )
}
export default Pages