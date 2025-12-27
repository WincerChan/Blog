import { useSearchParams } from "@solidjs/router";
import { ErrorBoundary, For, Show, Suspense, createEffect, createResource, createSignal, onMount } from "solid-js";
import { isBrowser, range } from "~/utils";
import { inkstoneApi } from "~/utils/inkstone";
import IconArrowLeft from "~icons/tabler/arrow-left";
import IconArrowRight from "~icons/tabler/arrow-right";
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

const SearchResultComponent = ({ data, currentPage, updatePage }) => {
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
    return (
        <>
            <span>共搜索到 {data().total} 篇文章
                <Show when={data().elapsed_ms != null}>（耗时 {data().elapsed_ms}ms）</Show>
                <Show when={data().total > 8}>，目前展示第 {currentPage} 页结果</Show></span>
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

const fetchSearchResult = async ({ q, page }: { q: string; page: number }) => {
    try {
        const url = new URL(inkstoneApi("search"));
        url.searchParams.set("q", q);
        url.searchParams.set("limit", String(resultPerPage));
        url.searchParams.set("offset", String((page - 1) * resultPerPage));
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
    const [query, setQuery] = createSignal<{ q: string; page: number }>()
    const [currentPage, setCurrentPage] = createSignal(1)
    const [serachParams, setSearchParams] = useSearchParams()
    const scrollElem = isBrowser ? document.querySelector('main') : null
    onMount(() => {
        const q = serachParams.q
        if (!q) return
        setInput(q)
        setQuery({ q, page: currentPage() })
    })
    createEffect(() => {
        setTimeout(() => scrollElem?.scrollIntoView({ behavior: 'smooth', block: 'start' }), currentPage() * 0)
    })
    const [resource] = createResource(query, fetchSearchResult)
    // 从 URL 读取
    const handleSubmit = (e) => {
        e.preventDefault();
        // 结果写入到 URL
        if (!input()) return
        setSearchParams({ q: input() })
        setCurrentPage(1)
        setQuery({ q: input(), page: 1 })
    }
    const handlePageChange = (action: number) => {
        const updatedPage = currentPage() + action
        setCurrentPage(updatedPage)
        setQuery({ q: input(), page: updatedPage })
    }
    return (
        <ArticlePage rawBlog={page} relates={[]} hideComment={true}>
            <form onSubmit={handleSubmit} method="get" class="">
                <input value={input()} onChange={(e) => setInput(e.target.value)} type="text" class="" placeholder="你想要找什么？我也想要" />
                <button title="搜索" class="">搜索</button>
            </form>
            <>
                {!query() && children}
                <Suspense fallback={<FakeResult limit={8} />}>
                    <ErrorBoundary fallback={err => errorMsg(err)}>
                        <Show when={resource()}>
                            <SearchResultComponent data={resource} currentPage={currentPage} updatePage={handlePageChange} />
                        </Show>
                    </ErrorBoundary>
                </Suspense>
            </>
        </ArticlePage >
    )
}

export default Search
