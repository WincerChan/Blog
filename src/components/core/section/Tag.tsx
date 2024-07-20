import { For } from "solid-js"

const TagCollection = ({ tags }: { tags: string[] }) => {
    return (
        <For each={tags}>
            {
                tag => (
                    <a href={`/tags/${tag}/`} class=":: hover:text-menu-transition ">
                        <span class=":: text-menu-active ">#</span>{tag}
                    </a>
                )
            }
        </For>
    )
}
export default TagCollection