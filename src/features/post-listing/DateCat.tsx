import { formatDate } from "~/utils";

type DateCatProps = {
    date: Date | string,
    category?: string
}

const DateCat = ({ date, category }: DateCatProps) => {
    return (
        <div class="">
            <span>{formatDate(date)}</span>
            <div class=""></div>
            {category && (
                <a class="" href={`/category/${category}/`}>
                    {category}
                </a>
            )}
        </div>
    )
}

export default DateCat;
