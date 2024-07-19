
type TitleProps = {
    children: string,
}

const ArticleTitle = ({ children }: TitleProps) => {
    return (
        <div class="flex">
            <h1 class=":: text-headline ">{children}
            </h1>
        </div>
    )
}

export default ArticleTitle;