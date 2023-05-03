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
            {
                pages.filter(x => x.slug !== 'search').map((pageEntry) => (
                    <li >
                        <A href={`/${pageEntry.slug}/`} class="h-menu flex inline-block items-center bg-menuHover text-menuHover trans-linear">{pageEntry.title}</A>
                    </li>
                ))
            }
        </ul>
    )
}
export default Pages