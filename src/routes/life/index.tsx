import { ErrorBoundary, For, Show, Suspense, createResource, createSignal, onMount } from "solid-js";
import lifePage from "~/../_output/base/life/index.json";
import PageLayout from "~/components/layouts/PageLayout";
import LazyImg from "~/components/lazy/Img";
import { PageSchema } from "~/schema/Page";
import { fetcher } from "~/utils";
import { range } from "~/utils/index";

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
                <div class="rounded pb-6">
                    <figure class="text-center text-sm rounded">
                        <div class="mx-auto xl:h-52 h-24 animate-pulse bg-[var(--cc)]"></div>
                        <div class="block mx-auto mt-1 p-1px h-5 w-2/3 bg-[var(--cc)]"></div>
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
        <div class="rounded pb-6">
            <figure class="text-center text-sm rouned">
                <a href={`https://${type}.douban.com/subject/${id}`} target="_blank">
                    <LazyImg class="mx-auto rounded" src={poster} title={`${date} ${type == 'movie' ? '看过' : '读过'}`} />
                </a>
                <span class="block truncate p-1px">{title}</span>
            </figure>
        </div>
    )
}


const Life = () => {
    const page = PageSchema.parse(lifePage)
    const [url, setUrl] = createSignal()
    onMount(() => setUrl('https://api.itswincer.com/douban/v1/'))
    const [resource] = createResource(url, fetcher)
    return (
        <PageLayout page={page} showComment={true}>
            <section innerHTML={lifePage.content} />
            <h3 class="text-center text-2xl font-headline leading-loose mb-4">我看过的书和电影（{new Date().getFullYear()}）</h3>
            <div class="grid grid-cols-4 md:grid-cols-5 gap-4 <md:mx-4">
                <Suspense fallback={<FakeItems limit={5} />}>
                    <ErrorBoundary fallback={err => <b class="<md:mx-4">{`获取数据时出现了一些问题，控制台或许有详细的原因。${err}`}</b>}>
                        <Show when={resource()}>
                            <For each={resource()}>
                                {item => <RealItem {...item} />}
                            </For>
                        </Show>
                    </ErrorBoundary>
                </Suspense>
            </div>
        </PageLayout>
    )
}

export default Life;

