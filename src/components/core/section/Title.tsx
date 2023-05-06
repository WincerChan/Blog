import { Show } from "solid-js";

type TitleProps = {
    title: string,
    words?: number
}

const ArticleTitle = ({ title, words }: TitleProps) => {
    return (
        <h1 class=":: text-3xl font-headline leading-loose title-responsive ">{title}
            <Show when={words}>
                <sup class="text-sm"> {words} words</sup>
            </Show>
        </h1>
    )
}

export default ArticleTitle;