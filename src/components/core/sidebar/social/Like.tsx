import { ErrorBoundary, Show, Suspense, createEffect, createResource, createSignal, onMount } from "solid-js";
import { fetcher } from "~/utils";


const Like = ({ pageURL }) => {
    const [liked, setLiked] = createSignal(false)
    const [likes, setLikes] = createSignal(0)
    const [url, setUrl] = createSignal()
    const [resource] = createResource(url, fetcher)
    const [animate, setAnimate] = createSignal(false)
    onMount(() => {
        const pathEncoded = btoa(pageURL).replace("+", "-").replace("/", "_")
        setUrl(`https://blog-exts.itswincer.com/api/likes/${pathEncoded}`)
    })
    const click = () => {
        fetch(url(), {
            "method": "PUT",
        })
        setAnimate(true)
        setLikes(likes() + 1)
        setLiked(true)
    }
    const format = (number) => {
        if (number < 1000) return number; // Return the number itself if it's less than 1000
        return (number / 1000).toFixed(1) + 'K'; // Return the number in "K" format if it's less than a million
        // You can continue with more conditions for millions, billions, etc.
    }
    createEffect(() => {
        const data = resource()
        if (data) {
            setLikes(data.total)
            setLiked(data["liked?"])
        }
    })
    const fallback = <span class="px-2">-</span>
    return (
        <button disabled={liked()} onClick={click} title={liked() ? `${likes()} 人已点赞` : "Like"} class={`hover:text-rose-500 trans-linear h-15 lg:w-12 font-sitetitle ${liked() ? "text-rose-500 cursor-not-allowed" : ""}`}>
            <i class={`w-9 lg:block mx-auto h-9 ${liked() ? "i-carbon-thumbs-up-filled" : "i-carbon-thumbs-up "} ${animate() ? " animate-heart-beat" : ""}`} />
            <Suspense fallback={fallback}>
                <ErrorBoundary fallback={fallback}>
                    <Show when={resource()} fallback={fallback}>
                        <span class="<lg:px-2 inline-block align-mid">{format(likes())}</span>
                    </Show>
                </ErrorBoundary>
            </Suspense>
        </button>
    )
}

export default Like