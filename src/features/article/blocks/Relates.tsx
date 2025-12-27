import { Accessor, For, Show } from "solid-js";
import { Translations } from "~/i18n/i18n-types";
import type { RelatedPost } from "~/features/article/types";
import { formatDate } from "~/utils";


const Relates = ({ relates, LL }: { relates: RelatedPost[], LL: Accessor<Translations> }) => {
    const visibleRelates = () => relates.slice(0, 3);
    return (
        <Show when={visibleRelates().length}>
            <div class="mt-8">
                <label class="text-sm uppercase tracking-wide text-[var(--c-text-subtle)]">
                    {LL && LL().post.RELATES}
                </label>
                <ol class="mt-3 space-y-4">
                    <For each={visibleRelates()}>
                        {(post) => (
                            <li>
                                <a
                                    class="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 text-[var(--c-text)]"
                                    href={post.slug}
                                >
                                    <span class="min-w-0 text-base md:text-lg font-medium leading-tight text-[var(--c-text)] transition-colors group-hover:text-[var(--c-link)]">
                                        {post.title}
                                    </span>
                                    <span class="text-sm font-mono tabular-nums leading-tight text-[var(--c-text-subtle)]">
                                        {formatDate(post.date)}
                                    </span>
                                </a>
                            </li>
                        )}
                    </For>
                </ol>
            </div>
        </Show>
    )
}

export default Relates;
