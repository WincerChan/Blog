import { For } from "solid-js"
import { A } from "solid-start"

const TagCollection = ({ tags }: { tags: string[] }) => {
    return (
        <For each={tags}>
            {
                tag => (
                    <A href={`/tags/${tag}/`} class="pr-3 text-menuHover">
                        <span class="text-menuActive">#</span>{tag}
                    </A>
                )
            }
        </For>
    )
}
export default TagCollection