
type TitleProps = {
    title: string,
    words?: number
}

const ArticleTitle = ({ title, words }: TitleProps) => {
    return (
        <div class="flex">
            <h1 class=":: font-headline leading-loose title-responsive ">{title}
            </h1>
        </div>
    )
}

export default ArticleTitle;