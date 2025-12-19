import { useSearchParams } from "@solidjs/router";
import nProgress from "nprogress";
import { ErrorBoundary, For, Show, Suspense, createEffect, createResource, createSignal, onMount } from "solid-js";
import { isBrowser, range } from "~/utils";
import IconArrowLeft from "~icons/carbon/arrow-left";
import IconArrowRight from "~icons/carbon/arrow-right";
import { globalStore } from "~/modules/site/header/ThemeSwitch/Provider";
import ArticlePage from "~/layouts/ArticlePage";

const resultPerPage = 8

const parseParams = (query: string) => {
    let terms: string[] = [], range = '', q: string[] = [], pages = ``;
    query.split(" ").forEach(t => {
        if (t.startsWith("tags:") || t.startsWith("category:")) {
            terms.push(t)
        } else if (t.startsWith("range:")) {
            range = t.slice(6)
        } else if (t.startsWith('pages')) {
            pages = t.slice(6)
        } else {
            q.push(t)
        }
    })
    return new URLSearchParams({
        pages: pages,
        terms: terms.join(","),
        range: range,
        q: q.join(" ")
    }).toString()
}
const FakeResult = ({ limit }: { limit: number }) => {
    return (
        <>
            <div class=":: h-7 animate-pulse bg-[var(--blockquote-border)] mb-8 w-1/2 " />
            <For each={range(limit)}>
                {
                    x => (
                        <div class=":: my-6 w-full ">
                            <div class=":: h-7 my-3 animate-pulse bg-[var(--blockquote-border)] w-1/2 md:w-1/3 "></div>
                            <div class=":: h-14 animate-pulse bg-[var(--blockquote-border)] "></div>
                        </div>
                    )
                }
            </For>
        </>
    )
}


const SearchResultComponent = ({ data, currentPage, updatePage }) => {
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
            <span>共搜索到 {data().count} 篇文章
                <Show when={data().count > 8}>，目前展示第 {currentPage} 页结果</Show></span>
            <For each={data().data}>
                {ret => (
                    <div class="my-4">
                        <h3 class=":: text-2xl font-headline font-medium leading-loose border-0 pl-0 my-0 <md:pl-4 ">
                            <a href={getPathname(ret.url)} innerHTML={ret.title}></a>
                        </h3>
                        <p class=":: text-justify my-0 ">
                            <span class=":: text-base font-medium mr-1 inline-block text-[var(--donate-text)] ">{formatDate(ret.date)} —</span>
                            <span innerHTML={ret.snippet + '...'} />
                        </p>
                    </div>
                )}
            </For>
            <div class=":: flex my-8 justify-between text-xl font-headline ">
                {
                    currentPage() != 1 && (
                        <button title="Prev" class=":: flex gap-2 items-center hover:text-menu-active " onClick={() => { updatePage(-1) }}>
                            <IconArrowLeft />
                            <span>Prev</span>
                        </button>
                    )
                }
                <div />
                {
                    data().count > resultPerPage * currentPage() &&
                    <button title="Next" class=":: flex gap-2 items-center hover:text-menu-active " onClick={() => { updatePage(1) }}>
                        <span>Next</span>
                        <IconArrowRight />
                    </button>
                }
            </div>
        </>
    )
}

const fetchSearchResult = async (q) => {
    const res = await fetch(`https://api.itswincer.com/blog-search/v1/?${parseParams(q)}`)
    return res.json()
}

const errorMsg = (err: string) => {
    return (
        <span>
            <b>{`搜索出错了，原因可能是 ${err}，控制台或许有更详细的原因。`}</b>
        </span>
    )
}

const Search = ({ page, children }) => {

    const [input, setInput] = createSignal('')
    const [query, setQuery] = createSignal()
    const [currentPage, setCurrentPage] = createSignal(1)
    const [serachParams, setSearchParams] = useSearchParams()
    const scrollElem = isBrowser ? document.querySelector('main') : null
    onMount(() => {
        const q = serachParams.q
        if (!q) return
        setInput(q)
        setQuery(`${q} pages:${currentPage()}-${resultPerPage}`)
    })
    createEffect(() => {
        setTimeout(() => scrollElem?.scrollIntoView({ behavior: 'smooth', block: 'start' }), currentPage() * 0)
    })
    createEffect(() => {
        if (resource()) nProgress.done()
    })

    const [resource] = createResource(query, fetchSearchResult)
    // 从 URL 读取
    const handleSubmit = (e) => {
        e.preventDefault();
        // 结果写入到 URL
        if (!input()) return
        setSearchParams({ q: input() })
        globalStore.trackEvent("Search", { props: { keyword: input() } })
        setQuery(`${input()} pages:${1}-${resultPerPage}`)
        setCurrentPage(1)
    }
    const handlePageChange = (action: number) => {
        const updatedPage = currentPage() + action
        setCurrentPage(updatedPage)
        setQuery(`${input()} pages:${updatedPage}-${resultPerPage}`)
    }
    return (
        <ArticlePage rawBlog={page} relates={[]} hideComment={true}>
            <form onSubmit={handleSubmit} method="get" class=":: flex space-x-4 my-6 ">
                <input value={input()} onChange={(e) => setInput(e.target.value)} type="text" class=":: outline-card bg-[var(--blockquote-border)] px-4 py-1.5 rounded flex-grow " placeholder="你想要找什么？我也想要" />
                <button title="搜索" class=":: font-headline px-4 outline-card rounded ">搜索</button>
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
