import { useSearchParams } from "@solidjs/router";
import { ErrorBoundary, For, Show, Suspense, createEffect, createResource, createSignal, onMount } from "solid-js";
import { isBrowser, range } from "~/utils";
import { inkstoneApi } from "~/utils/inkstone";
import IconArrowLeft from "~icons/ph/arrow-left";
import IconArrowRight from "~icons/ph/arrow-right";
import IconReturn from "~icons/ph/key-return";
import ArticlePage from "~/layouts/ArticlePage";

const resultPerPage = 8

const FakeResult = ({ limit }: { limit: number }) => {
    return (
        <>
            <div class="" />
            <For each={range(limit)}>
                {
                    x => (
                        <div class="">
                            <div class=""></div>
                            <div class=""></div>
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

const SearchResultComponent = ({ data, currentPage, updatePage, sort, onSortChange }: {
    data: () => { total: number; hits: any[]; elapsed_ms: number | null; error?: string };
    currentPage: () => number;
    updatePage: (action: number) => void;
    sort: () => SortType;
    onSortChange: (nextSort: SortType) => void;
}) => {
    if (data().error) {
        return errorMsg(data().error);
    }
    const formatDate = (dateStr: string) => {
        const cleanDateStr = dateStr.split(" ")[0]
        return new Date(cleanDateStr).toLocaleString("en-us", { year: "numeric", month: "short", day: "numeric" })
    }
    const getPathname = (postURL: string) => {
        const url = new URL(postURL)
        return url.pathname
    }
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
                {ret => (
                    <div class="">
                        <h3 class="">
                            <a href={getPathname(ret.url)} innerHTML={ret.title}></a>
                        </h3>
                        <p class="">
                            <span class="">{formatDate(ret.published_at)} —</span>
                            <span innerHTML={ret.content ? ret.content + '...' : ''} />
                        </p>
                    </div>
                )}
            </For>
            <div class="">
                {
                    currentPage() != 1 && (
                        <button title="Prev" class="" onClick={() => { updatePage(-1) }}>
                            <IconArrowLeft />
                            <span>Prev</span>
                        </button>
                    )
                }
                <div />
                {
                    data().total > resultPerPage * currentPage() &&
                    <button title="Next" class="" onClick={() => { updatePage(1) }}>
                        <span>Next</span>
                        <IconArrowRight />
                    </button>
                }
            </div>
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

const Search = ({ page, children }) => {

    const [input, setInput] = createSignal('')
    const [query, setQuery] = createSignal<{ q: string; page: number; sort: SortType }>()
    const [currentPage, setCurrentPage] = createSignal(1)
    const [sort, setSort] = createSignal<SortType>("relevance");
    const [serachParams, setSearchParams] = useSearchParams()
    const scrollElem = isBrowser ? document.querySelector('main') : null
    let inputRef: HTMLInputElement | undefined;
    const syntaxItems = [
        { label: "tag:{xxx}", token: "tag:" },
        { label: "category:{xxx}", token: "category:" },
        { label: "range:{yyyy-mm-dd}", token: "range:" },
    ];
    onMount(() => {
        const q = serachParams.q
        const initialSort = serachParams.sort === "latest" ? "latest" : "relevance";
        setSort(initialSort);
        if (!q) return
        setInput(q)
        setCurrentPage(1)
        setQuery({ q, page: 1, sort: initialSort })
    })
    createEffect(() => {
        setTimeout(() => scrollElem?.scrollIntoView({ behavior: 'smooth', block: 'start' }), currentPage() * 0)
    })
    const [resource] = createResource(query, fetchSearchResult)
    // 从 URL 读取
    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmed = input().trim()
        if (!trimmed) return
        const params: Record<string, string> = { q: trimmed };
        if (sort() === "latest") params.sort = "latest";
        setSearchParams(params)
        setCurrentPage(1)
        setQuery({ q: trimmed, page: 1, sort: sort() })
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
        const trimmed = input().trim()
        if (!trimmed) return
        const params: Record<string, string> = { q: trimmed };
        if (nextSort === "latest") params.sort = "latest";
        setSearchParams(params)
        setCurrentPage(1)
        setQuery({ q: trimmed, page: 1, sort: nextSort })
    }
    const appendSyntax = (token: string) => {
        setInput((prev) => {
            const base = prev.trimEnd();
            const spacer = base.length ? " " : "";
            return `${base}${spacer}${token}`;
        })
        requestAnimationFrame(() => {
            if (!inputRef) return
            inputRef.focus();
            const length = inputRef.value.length;
            inputRef.setSelectionRange(length, length);
        })
    }
    const clearInput = () => {
        setInput('')
        setCurrentPage(1)
        setQuery(undefined)
        setSearchParams({})
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
                        class="w-full border-0 border-b border-[var(--c-border-strong)] bg-transparent pb-3 pr-20 text-3xl md:text-4xl font-mono tracking-tight text-[var(--c-text)] outline-none caret-[var(--c-link)] placeholder:text-[var(--c-text-subtle)]"
                        placeholder=""
                        aria-label="Search"
                    />
                    <IconReturn
                        width={20}
                        height={20}
                        class="pointer-events-none absolute right-0 bottom-3 text-[var(--c-text-subtle)]"
                    />
                    <Show when={input().trim().length > 0}>
                        <button
                            type="button"
                            onClick={clearInput}
                            class="absolute right-8 bottom-3 text-sm text-[var(--c-text-subtle)] transition-colors hover:text-[var(--c-text)]"
                        >
                            清除
                        </button>
                    </Show>
                </form>
                <p class="mt-3 text-sm text-[var(--c-text-subtle)]">Type to Search</p>
                <div class="mt-4 flex flex-wrap items-center gap-2 text-sm text-[var(--c-text-subtle)]">
                    <span>支持语法</span>
                    <For each={syntaxItems}>
                        {(item) => (
                            <button
                                type="button"
                                class="rounded-full border border-[var(--c-border)] px-3 py-1 font-mono transition-colors hover:border-[var(--c-border-strong)] hover:text-[var(--c-text)]"
                                onClick={() => appendSyntax(item.token)}
                            >
                                {item.label}
                            </button>
                        )}
                    </For>
                </div>
            </div>
            <div class="mt-10">
                {!query() && children}
                <Suspense fallback={<FakeResult limit={8} />}>
                    <ErrorBoundary fallback={err => errorMsg(err)}>
                        <Show when={resource()}>
                            <SearchResultComponent
                                data={resource}
                                currentPage={currentPage}
                                updatePage={handlePageChange}
                                sort={sort}
                                onSortChange={handleSortChange}
                            />
                        </Show>
                    </ErrorBoundary>
                </Suspense>
            </div>
        </ArticlePage >
    )
}

export default Search
