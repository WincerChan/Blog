import { For } from "solid-js"
import { A } from "solid-start"

const TagCollection = ({ tags }: { tags: string[] }) => {
    return (
        <For each={tags}>
            {
                tag => (
                    <A href={`/tags/${tag}/`} inactiveClass="" class=":: text-menuHover ">
                        <span class=":: text-menuActive ">#</span>{tag}
                    </A>
                )
            }
        </For>
    )
}
export default TagCollection