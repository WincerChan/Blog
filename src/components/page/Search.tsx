import searchPage from "@/_output/base/search/index.json";
import { ErrorBoundary, For, Show, Suspense, createEffect, createResource, createSignal, onMount } from "solid-js";
import { A, useSearchParams } from "solid-start";
import PageLayout from "~/components/layouts/PageLayout";
import { PageSchema } from "~/schema/Page";
import { isBrowser, range } from "~/utils";

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
            <div class="h-7 animate-pulse bg-[var(--cc)] mb-8 w-1/2" />
            <For each={range(limit)}>
                {
                    x => (
                        <div class="my-6 w-full">
                            <div class="h-7 my-3 animate-pulse bg-[var(--cc)] w-1/2 md:w-1/3"></div>
                            <div class="h-14 animate-pulse bg-[var(--cc)]"></div>
                        </div>
                    )
                }
            </For>
        </>
    )
}


const SearchResultComponent = ({ data, currentPage, updatePage }) => {
    return (
        <>
            <span>共搜索到 {data().count} 篇文章，目前展示第 {currentPage} 页结果</span>
            <For each={data().data}>
                {ret => (
                    <div class="my-6">
                        <h3 class="text-xl font-headline text-title leading-loose">
                            <A href={ret.url} innerHTML={ret.title}></A>
                        </h3>
                        <p class="text-justify">
                            <span class="text-subtitle mr-4 inline-block">{ret.date.split(" ")[0]}</span>
                            <span innerHTML={ret.snippet + '...'} />
                        </p>
                    </div>
                )}
            </For>
            <div class="flex mt-8 justify-between text-xl font-headline">
                {
                    currentPage() != 1 && (
                        <button title="Prev" class="flex items-center text-menuHover" onClick={() => { updatePage(-1) }}>
                            <span class="i-carbon-arrow-left mr-2" />
                            <span>Prev</span>
                        </button>
                    )
                }
                <div />
                {
                    data().count > resultPerPage * currentPage() &&
                    <button title="Next" class="flex items-center text-menuHover" onClick={() => { updatePage(1) }}>
                        <span>Next</span>
                        <span class="i-carbon-arrow-right ml-2"></span>
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

const Search = () => {
    const page = PageSchema.parse(searchPage)

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

    const [resource] = createResource(query, fetchSearchResult)
    // 从 URL 读取
    const handleSubmit = (e) => {
        e.preventDefault();
        // 结果写入到 URL
        if (!input()) return
        setSearchParams({ q: input() })
        setQuery(`${input()} pages:${1}-${resultPerPage}`)
        setCurrentPage(1)
    }
    const handlePageChange = (action: number) => {
        const updatedPage = currentPage() + action
        setCurrentPage(updatedPage)
        setQuery(`${input()} pages:${updatedPage}-${resultPerPage}`)
    }
    return (
        <PageLayout page={page} showComment={false}>
            <form onSubmit={handleSubmit} method="get" class="flex space-x-4 my-6 <md:mx-4">
                <input value={input()} onChange={(e) => setInput(e.target.value)} type="text" class="card-outline bg-[var(--cc)] px-4 py-1.5 rounded flex-grow" placeholder="你想要找什么？我也想要" />
                <button title="搜索" class="font-headline px-4 card-outline rounded">搜索</button>
            </form>
            <div class="<md:mx-4">
                {!query() && <section innerHTML={page.content} />}
                <Suspense fallback={<FakeResult limit={8} />}>
                    <ErrorBoundary fallback={err => errorMsg(err)}>
                        <Show when={resource()}>
                            <SearchResultComponent data={resource} currentPage={currentPage} updatePage={handlePageChange} />
                        </Show>
                    </ErrorBoundary>
                </Suspense>
            </div>
        </PageLayout >
    )
}

export default Search