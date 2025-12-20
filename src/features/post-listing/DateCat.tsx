import { formatDate } from "~/utils";

type DateCatProps = {
    date: Date | string,
    category?: string
}

const DateCat = ({ date, category }: DateCatProps) => {
    return (
        <div class=":: flex items-center leading-tight ">
            <span>{formatDate(date)}</span>
            <div class=":: h-0.5 w-0.5 mx-4 rounded-full bg-[var(--subtitle)] "></div>
            {category && (
                <a class="hover:text-menu-active hover:underline hover:decoration-1 hover:underline-offset-4" href={`/category/${category}/`}>
                    {category}
                </a>
            )}
        </div>
    )
}

export default DateCat;
