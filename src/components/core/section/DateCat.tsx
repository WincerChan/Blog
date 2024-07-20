import { formatDate } from "~/utils";

type DateCatProps = {
    date: Date,
    category: string
}

const DateCat = ({ date, category }: DateCatProps) => {
    return (
        <div class=":: flex items-center leading-tight ">
            <span>{formatDate(date)}</span>
            <div class=":: h-0.5 w-0.5 mx-4 rounded-full bg-[var(--subtitle)] "></div>
            <a class="hover:text-menu-transition" href={`/category/${category}/`}>{category}</a>
        </div>
    )
}

export default DateCat;