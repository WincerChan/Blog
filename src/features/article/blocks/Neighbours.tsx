import { Accessor } from "solid-js";
import IconArrowLeft from "~icons/ph/arrow-left";
import IconArrowRight from "~icons/ph/arrow-right";
import type { Translations } from "~/i18n/i18n-types";
import type { ArticleNeighbours } from "~/features/article/types";

const Neighbours = ({
    neighbours,
    LL,
}: {
    neighbours?: ArticleNeighbours;
    LL: Accessor<Translations>;
}) => {
    const { prev, next } = neighbours ?? {};
    return (
        <div class="mt-12 mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {next && (
                <a
                    href={next.slug}
                    class="group inline-flex flex-col items-start gap-1 text-[var(--c-text)]"
                >
                    <span class="inline-flex items-center gap-2 text-sm text-[var(--c-text-subtle)] transition-colors group-hover:text-[var(--c-link)]">
                        <IconArrowLeft class="h-4 w-4 shrink-0 transition-transform group-hover:-translate-x-1" />
                        {LL && LL().post.NEWER}
                    </span>
                    <span class="text-base md:text-lg font-medium">
                        {next.title}
                    </span>
                </a>
            )}
            {prev && (
                <a
                    href={prev.slug}
                    class="group inline-flex flex-col items-start gap-1 text-[var(--c-text)] ml-auto items-end text-right md:ml-auto md:items-end md:text-right"
                >
                    <span class="inline-flex items-center gap-2 text-sm text-[var(--c-text-subtle)] transition-colors group-hover:text-[var(--c-link)]">
                        {LL && LL().post.OLDER}
                        <IconArrowRight class="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
                    </span>
                    <span class="text-base md:text-lg font-medium">
                        {prev.title}
                    </span>
                </a>
            )}
        </div>
    );
};

export default Neighbours;
