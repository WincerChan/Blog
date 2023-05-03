type TitleProps = {
    title: string,
    words?: number
}

const ArticleTitle = ({ title, words }: TitleProps) => {
    return (
        <h1 class="text-3xl font-headline leading-loose <md:text-2xl <md:mx-4 <md:leading-10 <md:my-2">{title}
            {
                words && <sup class="text-sm"> {words} words</sup>
            }
        </h1>
    )
}

export default ArticleTitle;