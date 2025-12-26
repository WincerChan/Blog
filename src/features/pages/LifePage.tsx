import {
    ErrorBoundary,
    For,
    Show,
    Suspense,
    createMemo,
    createResource,
    createSignal,
    onMount,
} from "solid-js";
import LazyImg from "~/ui/media/Img";
import { fetcher } from "~/utils";
import { inkstoneApi } from "~/utils/inkstone";
import { range } from "~/utils/index";
import ArticlePage from "~/layouts/ArticlePage";

type WishingItemType = {
    date: string;
    id: number;
    poster: string;
    title: string;
    type: string;
};

const FakeItems = ({ limit }: { limit: number }) => {
    return (
        <For each={range(limit)}>
            {(x) => (
                <div class="">
                    <figure class="">
                        <div class=""></div>
                        <div class=""></div>
                    </figure>
                </div>
            )}
        </For>
    );
};

type Item = {
    date: string;
    poster: string;
    title: string;
    type: string;
    url: string;
};

const action = (type: string) => {
    if (type == "movie") return "看过";
    if (type == "music") return "听过";
    if (type == "game") return "玩过";
    if (type == "book") return "读过";
    return "";
};

const RealItem = ({ poster, title, type, date, url }: Item) => {
    const cover = (
        <LazyImg
            class=""
            src={poster}
            title={`${date} ${action(type)}`}
        />
    );
    return (
        <div class="">
            <figure class="">
                <Show
                    when={url}
                    fallback={<span class="">{cover}</span>}
                >
                    <a href={url} target="_blank" rel="noreferrer">
                        {cover}
                    </a>
                </Show>
                <span class="">{title}</span>
            </figure>
        </div>
    );
};

const Life = ({ page, children }) => {
    const [url, setUrl] = createSignal();
    const year = createMemo(() => new Date().getFullYear());
    onMount(() => {
        setUrl(inkstoneApi("douban/marks"));
    });
    const [resource] = createResource(url, fetcher);
    const items = createMemo(() => resource()?.items ?? []);
    const { content, ...rest } = page;
    return (
        <ArticlePage rawBlog={rest} relates={[]}>
            {children}
            <h3 class="">
                文字、光影与沉浸的梦（{year()}）
            </h3>
            <div class="">
                <Suspense fallback={<FakeItems limit={5} />}>
                    <ErrorBoundary
                        fallback={(err) => (
                            <b class="">{`获取数据时出现了一些问题，控制台或许有详细的原因。${err}`}</b>
                        )}
                    >
                        <Show when={resource()}>
                            <For each={items()}>
                                {(item) => <RealItem {...item} />}
                            </For>
                        </Show>
                    </ErrorBoundary>
                </Suspense>
            </div>
        </ArticlePage>
    );
};

export default Life;
