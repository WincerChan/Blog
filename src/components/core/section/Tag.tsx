import { A } from "@solidjs/router"
import { For } from "solid-js"

const TagCollection = ({ tags }: { tags: string[] }) => {
    return (
        <For each={tags}>
            {
                tag => (
                    <A href={`/tags/${tag}/`} class=":: hover:text-menu-transition ">
                        <span class=":: text-menu-active ">#</span>{tag}
                    </A>
                )
            }
        </For>
    )
}
export default TagCollection