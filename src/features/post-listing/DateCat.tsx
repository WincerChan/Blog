type DateCatProps = {
    date: Date | string,
    category?: string
}

const formatDateISO = (value: Date | string) => {
    const dateObj = typeof value === "string" ? new Date(value) : value;
    if (!dateObj || Number.isNaN(dateObj.getTime())) return String(value ?? "");
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const DateCat = ({ date, category }: DateCatProps) => {
    const formattedDate = formatDateISO(date);
    return (
        <div class="flex items-center gap-2 text-xs uppercase tracking-wide text-[var(--c-text-subtle)]">
            <time dateTime={formattedDate}>{formattedDate}</time>
            {category && <div class="h-1 w-1 rounded-full bg-[var(--c-border-strong)]" />}
            {category && (
                <a
                    class="text-[var(--c-text-subtle)] hover:text-[var(--c-link)] transition-colors"
                    href={`/category/${category}/`}
                >
                    {category}
                </a>
            )}
        </div>
    )
}

export default DateCat;
