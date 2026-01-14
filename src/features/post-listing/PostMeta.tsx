type PostMetaProps = {
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

const PostMeta = ({ date, category }: PostMetaProps) => {
    const formattedDate = formatDateISO(date);
    const encodedCategory = category ? encodeURIComponent(category) : "";
    return (
        <div class="flex items-center gap-2 text-sm uppercase tracking-wide font-mono text-[var(--c-text-subtle)]">
            <time dateTime={formattedDate}>{formattedDate}</time>
            {category && <span class="text-[var(--c-text-subtle)]">/</span>}
            {category && (
                <a
                    class="text-[var(--c-text-subtle)] hover:text-[var(--c-link)] hover:underline hover:decoration-[var(--c-link)] hover:decoration-dashed decoration-1 underline-offset-4 transition-colors"
                    href={`/category/${encodedCategory}/`}
                >
                    {category}
                </a>
            )}
        </div>
    )
}

export default PostMeta;
