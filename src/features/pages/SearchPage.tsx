import { useSearchParams } from "@solidjs/router";
import { ErrorBoundary, For, Show, Suspense, createEffect, createResource, createSignal, on, untrack } from "solid-js";
import { isBrowser, range } from "~/utils";
import { inkstoneApi } from "~/utils/inkstone";
import IconArrowLeft from "~icons/ph/arrow-left";
import IconArrowRight from "~icons/ph/arrow-right";
import IconReturn from "~icons/ph/arrow-elbow-down-left";
import IconClear from "~icons/ph/backspace";
import ArticlePage from "~/layouts/ArticlePage";
import { canAppendToken, findToken, normalizeQuery } from "./searchQuery";

const resultPerPage = 8

const FakeResult = ({ limit }: { limit: number }) => {
    return (
        <>
            <div class="flex items-center justify-between gap-3 text-sm">
                <div class="h-4 w-56 rounded bg-[var(--c-border)] opacity-60" />
                <div class="h-4 w-32 rounded bg-[var(--c-border)] opacity-60" />
            </div>
            <For each={range(limit)}>
                {
                    x => (
                        <div class="mt-6 first:mt-4 border-b border-[var(--c-border)] pb-6 last:border-b-0 last:pb-0">
                            <div class="h-4 w-40 rounded bg-[var(--c-border)] opacity-60" />
                            <div class="mt-3 h-6 w-2/3 rounded bg-[var(--c-border)] opacity-70" />
                            <div class="mt-2 h-4 w-full rounded bg-[var(--c-border)] opacity-60" />
                            <div class="mt-2 h-4 w-5/6 rounded bg-[var(--c-border)] opacity-60" />
                            <div class="mt-3 flex flex-wrap gap-2">
                                <div class="h-4 w-16 rounded bg-[var(--c-border)] opacity-60" />
                                <div class="h-4 w-20 rounded bg-[var(--c-border)] opacity-60" />
                                <div class="h-4 w-14 rounded bg-[var(--c-border)] opacity-60" />
                            </div>
                        </div>
                    )
                }
            </For>
        </>
    )
}


const errorMsg = (err: string) => {
    return (
        <span>
            <b>{`搜索出错了，原因可能是 ${err}，控制台或许有更详细的原因。`}</b>
        </span>
    )
}

type SortType = "relevance" | "latest";

const SearchResultComponent = ({ data, currentPage, updatePage, sort, onSortChange, queryText }: {
    data: () => { total: number; hits: any[]; elapsed_ms: number | null; error?: string };
    currentPage: () => number;
    updatePage: (action: number) => void;
    sort: () => SortType;
    onSortChange: (nextSort: SortType) => void;
    queryText: () => string | undefined;
}) => {
    if (data().error) {
        return errorMsg(data().error);
    }
    const formatDateISO = (value: string) => {
        const dateObj = new Date(value);
        if (!dateObj || Number.isNaN(dateObj.getTime())) return String(value ?? "");
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, "0");
        const day = String(dateObj.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }
    const getPathname = (postURL: string) => {
        const url = new URL(postURL)
        return url.pathname
    }
    const isTagFilterActive = () => {
        const value = queryText()?.toLowerCase() ?? "";
        return /(?:^|\s)tags?:[^\s]+/.test(value);
    };
    const isSubtitleMatched = (matched: any) => matched?.subtitle === true;
    const elapsed = data().elapsed_ms ?? "--";
    return (
        <>
            <div class="flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--c-text-subtle)]">
                <span>找到 {data().total} 条记录，耗时 {elapsed}ms</span>
                <div class="flex items-center gap-2">
                    <span>排序：</span>
                    <button
                        type="button"
                        onClick={() => onSortChange("relevance")}
                        class="transition-colors"
                        classList={{
                            "font-semibold text-[var(--c-text)]": sort() === "relevance",
                            "text-[var(--c-text-subtle)] hover:text-[var(--c-text)]": sort() !== "relevance",
                        }}
                    >
                        相关度
                    </button>
                    <span class="text-[var(--c-border-strong)]">/</span>
                    <button
                        type="button"
                        onClick={() => onSortChange("latest")}
                        class="transition-colors"
                        classList={{
                            "font-semibold text-[var(--c-text)]": sort() === "latest",
                            "text-[var(--c-text-subtle)] hover:text-[var(--c-text)]": sort() !== "latest",
                        }}
                    >
                        最新
                    </button>
                </div>
            </div>
            <For each={data().hits}>
                {(ret, idx) => (
                    <div
                        class="mt-6 first:mt-4 border-b border-[var(--c-border)] pb-6"
                        classList={{ "border-b-0 pb-0": idx() === data().hits.length - 1 }}
                    >
                        <h3 class="mt-3! mb-1! text-xl md:text-2xl font-medium font-sans">
                            <a class="text-[var(--c-text)]! no-underline!" href={getPathname(ret.url)} innerHTML={ret.title}></a>
                        </h3>
                        <Show when={ret.subtitle && isSubtitleMatched(ret.matched)}>
                            <span class="search-snippet text-lg text-[var(--c-text-muted)] " innerHTML={ret.subtitle}></span>
                        </Show>
                        <p class="mt-2 text-base text-[var(--c-text-muted)] leading-relaxed mb-3!">
                            <span class="search-snippet" innerHTML={ret.content ? `...${ret.content}...` : ""} />
                        </p>
                        <div class="mt-3 flex items-center gap-2 text-sm uppercase tracking-wide font-mono text-[var(--c-text-subtle)] whitespace-nowrap overflow-hidden">
                            <time dateTime={formatDateISO(ret.published_at)}>
                                {formatDateISO(ret.published_at)}
                            </time>
                            {ret.category && <span class="text-[var(--c-text-subtle)]">/</span>}
                            {ret.category && (
                                <span
                                    class="text-[var(--c-text-subtle)] transition-colors"
                                    classList={{
                                        "bg-[var(--c-selection)] rounded px-1 text-[var(--c-text)]": ret.matched?.category,
                                    }}
                                >
                                    {ret.category}
                                </span>
                            )}
                            {(() => {
                                const matchedTags = (ret.matched?.tags ?? []).filter((tag) =>
                                    (ret.tags ?? []).includes(tag),
                                );
                                if (!matchedTags.length || isTagFilterActive()) return null;
                                return (
                                    <>
                                        <span class="text-[var(--c-text-subtle)]">/</span>
                                        <For each={matchedTags}>
                                            {(tag) => (
                                                <span class="text-[var(--c-text-subtle)] transition-colors bg-[var(--c-selection)] rounded px-1 text-[var(--c-text)]">
                                                    #{tag}
                                                </span>
                                            )}
                                        </For>
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                )}
            </For>
            <div class="mt-8 grid grid-cols-3 items-center text-sm text-[var(--c-text-subtle)]">
                <div class="justify-self-start">
                    <Show when={currentPage() !== 1}>
                        <button
                            title="Prev"
                            class="inline-flex items-center gap-2 transition-colors hover:text-[var(--c-text)]"
                            onClick={() => { updatePage(-1) }}
                        >
                            <IconArrowLeft width={16} height={16} />
                            <span>上一页</span>
                        </button>
                    </Show>
                </div>
                <span class="justify-self-center tabular-nums">
                    第 {currentPage()} 页 / 共 {Math.max(1, Math.ceil(data().total / resultPerPage))} 页
                </span>
                <div class="justify-self-end">
                    <Show when={data().total > resultPerPage * currentPage()}>
                        <button
                            title="Next"
                            class="inline-flex items-center gap-2 transition-colors hover:text-[var(--c-text)]"
                            onClick={() => { updatePage(1) }}
                        >
                            <span>下一页</span>
                            <IconArrowRight width={16} height={16} />
                        </button>
                    </Show>
                </div>
            </div>
            <style>{`
                .search-snippet b {
                    background: var(--c-selection);
                    color: var(--c-text);
                    padding: 0 0.2em;
                    border-radius: 0.25rem;
                }
            `}</style>
        </>
    )
}

const emptySearchResult = (error?: string) => ({
    total: 0,
    hits: [],
    elapsed_ms: null,
    error,
});

const fetchSearchResult = async ({ q, page, sort }: { q: string; page: number; sort: SortType }) => {
    try {
        const url = new URL(inkstoneApi("search"));
        url.searchParams.set("q", q);
        url.searchParams.set("limit", String(resultPerPage));
        url.searchParams.set("offset", String((page - 1) * resultPerPage));
        url.searchParams.set("sort", sort);
        const res = await fetch(url);
        if (!res.ok) {
            const msg = await res.text().catch(() => "");
            return emptySearchResult(msg || res.statusText);
        }
        const data = await res.json();
        return { ...data, error: null };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return emptySearchResult(message);
    }
}

const Search = ({ page }) => {

    const [input, setInput] = createSignal('')
    const [query, setQuery] = createSignal<{ q: string; page: number; sort: SortType }>()
    const [currentPage, setCurrentPage] = createSignal(1)
    const [sort, setSort] = createSignal<SortType>("relevance");
    const [serachParams, setSearchParams] = useSearchParams()
    const scrollElem = isBrowser ? document.querySelector('main') : null
    let inputRef: HTMLInputElement | undefined;
    const syntaxItems = [
        { label: "tag:{name}", token: "tag:" },
        { label: "category:{name}", token: "category:" },
        { label: "range:{yyyy-mm-dd}~{yyyy-mm-dd}", token: "range:" },
    ];
    const setQueryIfChanged = (next?: { q: string; page: number; sort: SortType }) => {
        const current = query();
        if (!next) {
            if (current) setQuery(undefined);
            return;
        }
        if (!current || current.q !== next.q || current.page !== next.page || current.sort !== next.sort) {
            setQuery(next);
        }
    };
    createEffect(on([() => serachParams.q, () => serachParams.sort], () => {
        const q = serachParams.q;
        const nextSort = serachParams.sort === "latest" ? "latest" : "relevance";
        setSort(nextSort);
        if (!q) {
            setInput("");
            setCurrentPage(1);
            setQuery(undefined);
            return;
        }
        if (untrack(input) !== q) setInput(q);
        setCurrentPage(1);
        const normalized = normalizeQuery(q);
        if (!normalized) {
            setQueryIfChanged(undefined);
            return;
        }
        setQueryIfChanged({ q: normalized, page: 1, sort: nextSort });
    }));
    createEffect(() => {
        setTimeout(() => scrollElem?.scrollIntoView({ behavior: 'smooth', block: 'start' }), currentPage() * 0)
    })
    const [resource] = createResource(query, fetchSearchResult)
    // 从 URL 读取
    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmed = input().trim();
        if (!trimmed) return;
        const normalized = normalizeQuery(trimmed);
        if (!normalized) return;
        const nextSort = sort();
        const params: Record<string, string> = { q: trimmed };
        if (nextSort === "latest") params.sort = "latest";
        if (serachParams.q === params.q && serachParams.sort === params.sort) {
            setCurrentPage(1);
            setQueryIfChanged({ q: normalized, page: 1, sort: nextSort });
            return;
        }
        setSearchParams(params);
    }
    const handlePageChange = (action: number) => {
        const currentQuery = query()?.q
        if (!currentQuery) return
        const updatedPage = currentPage() + action
        setCurrentPage(updatedPage)
        setQuery({ q: currentQuery, page: updatedPage, sort: sort() })
    }
    const handleSortChange = (nextSort: SortType) => {
        if (nextSort === sort()) return
        setSort(nextSort)
        const trimmed = input().trim();
        if (!trimmed) return;
        const normalized = normalizeQuery(trimmed);
        if (!normalized) return;
        const params: Record<string, string> = { q: trimmed };
        if (nextSort === "latest") params.sort = "latest";
        if (serachParams.q === params.q && serachParams.sort === params.sort) {
            setCurrentPage(1);
            setQueryIfChanged({ q: normalized, page: 1, sort: nextSort });
            return;
        }
        setSearchParams(params);
    }
    const appendSyntax = (token: string) => {
        const current = input();
        const trimmed = current.trimEnd();
        const focusInput = (start?: number, end?: number) => {
            requestAnimationFrame(() => {
                if (!inputRef) return;
                inputRef.focus();
                const length = inputRef.value.length;
                const from = start ?? length;
                const to = end ?? from;
                inputRef.setSelectionRange(from, to);
            });
        };
        if (token === "category:") {
            const match = findToken(current, token);
            if (match) {
                focusInput(match.valueStart, match.valueEnd > match.valueStart ? match.valueEnd : match.valueStart);
                return;
            }
        }
        if (trimmed.endsWith(token)) {
            focusInput();
            return;
        }
        if (!canAppendToken(trimmed, token)) return;
        const spacer = trimmed.length ? " " : "";
        setInput(`${trimmed}${spacer}${token}`);
        focusInput();
    }
    const clearInput = () => {
        setInput('')
        setCurrentPage(1)
        setQuery(undefined)
        setSearchParams({ q: undefined, sort: undefined } as Record<string, string | undefined>)
    }
    return (
        <ArticlePage rawBlog={page} relates={[]} hideComment={true} hideActions={true}>
            <div class="mt-10 md:mt-14">
                <form onSubmit={handleSubmit} method="get" class="relative">
                    <input
                        value={input()}
                        ref={inputRef}
                        onInput={(e) => setInput(e.target.value)}
                        type="text"
                        class="w-full border-0 border-b-2 border-[var(--c-border-strong)] bg-transparent pb-3 pr-32 text-2xl md:text-3xl font-mono tracking-tight text-[var(--c-text)] outline-none caret-[var(--c-text)] placeholder:text-[var(--c-text-subtle)] focus:border-[var(--c-link)]"
                        placeholder="输入关键词"
                        aria-label="Search"
                    />
                    <div class="absolute right-0 bottom-3 flex items-center gap-3">
                        <Show when={input().trim().length > 0}>
                            <button
                                type="button"
                                onClick={clearInput}
                                class="inline-flex items-center text-[var(--c-text-subtle)] transition-colors hover:text-[var(--c-text)]"
                            >
                                <IconClear width={20} height={20} class="block opacity-70" />
                            </button>
                        </Show>
                        <button
                            type="submit"
                            class="inline-flex items-center gap-1 rounded-md border border-[var(--c-border)] px-3 py-1 text-sm font-mono text-[var(--c-text-subtle)] transition-colors hover:text-[var(--c-text)]"
                        >
                            <span class="hidden md:inline">ENTER</span>
                            <IconReturn width={16} height={16} class="block" />
                        </button>
                    </div>
                </form>
                <div class="mt-4 flex flex-wrap items-center gap-2 text-sm text-[var(--c-text-subtle)]">
                    <span>支持语法</span>
                    <For each={syntaxItems}>
                        {(item) => (
                            <button
                                type="button"
                                class="rounded-md border border-[var(--c-border)] px-4 py-1.5 font-mono transition-colors hover:border-[var(--c-border-strong)] hover:text-[var(--c-text)]"
                                onClick={() => appendSyntax(item.token)}
                            >
                                {item.label}
                            </button>
                        )}
                    </For>
                </div>
            </div>
            <div class="mt-10">
                <Show when={query()}>
                    <Suspense fallback={<FakeResult limit={4} />}>
                        <ErrorBoundary fallback={err => errorMsg(err)}>
                            <Show when={resource()}>
                                <SearchResultComponent
                                    data={resource}
                                    currentPage={currentPage}
                                    updatePage={handlePageChange}
                                    sort={sort}
                                    onSortChange={handleSortChange}
                                    queryText={() => query()?.q}
                                />
                            </Show>
                        </ErrorBoundary>
                    </Suspense>
                </Show>
            </div>
        </ArticlePage >
    )
}

export default Search
