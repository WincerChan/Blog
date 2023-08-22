import lifePage from "@/_output/base/life/index.json";
import { ErrorBoundary, For, Show, Suspense, createMemo, createResource, createSignal, onMount } from "solid-js";
import LazyImg from "~/components/lazy/Img";
import { fetcher } from "~/utils";
import { range } from "~/utils/index";
import PostLayout from "../layouts/PostLayout";


type WishingItemType = {
    date: string,
    id: number,
    poster: string,
    title: string,
    type: string,
}

const FakeItems = ({ limit }: { limit: number }) => {
    return (
        <For each={range(limit)}>
            {x => (
                <div class=":: rounded pb-6 ">
                    <figure class=":: text-center text-sm rounded ">
                        <div class=":: mx-auto xl:h-52 h-24 animate-pulse bg-[var(--blockquote-border)] "></div>
                        <div class=":: block mx-auto mt-1 p-1px h-5 w-2/3 bg-[var(--blockquote-border)] "></div>
                    </figure>
                </div>
            )}
        </For>
    )
}

type Item = {
    date: string,
    id: number,
    poster: string,
    title: string,
    type: string
}

const RealItem = ({ poster, id, title, type, date }: Item) => {
    return (
        <div class=":: rounded pb-6 ">
            <figure class=":: text-center text-sm rounded ">
                <a href={`https://${type}.douban.com/subject/${id}`} target="_blank">
                    <LazyImg class=":: mx-auto rounded " src={poster} title={`${date} ${type == 'movie' ? '看过' : '读过'}`} />
                </a>
                <span class=":: block truncate p-1px ">{title}</span>
            </figure>
        </div>
    )
}


const Life = () => {
    const page = lifePage
    const [url, setUrl] = createSignal()
    const year = createMemo(() => new Date().getFullYear())
    onMount(() => {
        setUrl('https://api.itswincer.com/douban/v1/');
    })
    const [resource] = createResource(url, fetcher)
    return (
        <PostLayout rawBlog={page}>
            <section innerHTML={lifePage.content} />
            <h3 class=":: text-center text-2xl font-headline leading-loose mb-4 border-0 ">我看过的书和电影（{year()}）</h3>
            <div class="life-responsive">
                <Suspense fallback={<FakeItems limit={5} />}>
                    <ErrorBoundary fallback={err => <b class=":: col-span-5  ">{`获取数据时出现了一些问题，控制台或许有详细的原因。${err}`}</b>}>
                        <Show when={resource()}>
                            <For each={resource()}>
                                {item => <RealItem {...item} />}
                            </For>
                        </Show>
                    </ErrorBoundary>
                </Suspense>
            </div>
        </PostLayout>
    )
}

export default Life;

