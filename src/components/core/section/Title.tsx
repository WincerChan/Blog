
type TitleProps = {
    children: string,
}

const ArticleTitle = ({ children }: TitleProps) => {
    return (
        <div class="flex">
            <h1 class=":: font-headline leading-loose title-responsive ">{children}
            </h1>
        </div>
    )
}

export default ArticleTitle;