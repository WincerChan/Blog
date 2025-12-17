import { ErrorBoundary, Show, Suspense, createEffect, createResource, createSignal, onMount } from "solid-js";
import { fetcher } from "~/utils";
import IconThumbUp from "~icons/carbon/thumbs-up";
import IconThumbUpFilled from "~icons/carbon/thumbs-up-filled";


const Like = ({ pageURL }) => {
    const [liked, setLiked] = createSignal(false)
    const [likes, setLikes] = createSignal(0)
    const [disabled, setDisabled] = createSignal(false)
    const [url, setUrl] = createSignal()
    const [resource] = createResource(url, fetcher)
    const [animate, setAnimate] = createSignal(false)
    onMount(() => {
        let slug = pageURL;
        if (pageURL.endsWith("-zh/")) slug = pageURL.replace("-zh/", "/")
        if (pageURL.endsWith("-en/")) slug = pageURL.replace("-en/", "/")
        const pathEncoded = btoa(slug).replace("+", "-").replace("/", "_")
        setUrl(`${__SITE_CONF.extURL}/api/likes/${pathEncoded}`)
    })
    const click = () => {
        fetch(url(), {
            "method": "PUT",
        })
        setAnimate(true)
        setLikes(likes() + 1)
        setDisabled(true)
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
            if (data["liked?"]) setDisabled(true)
        } else if (data !== undefined) {
            setDisabled(true)
        }
    })
    const fallback = <span class="px-2">-</span>
    return (
        <button disabled={disabled()} onClick={click} title={liked() ? `${likes()} 人已点赞` : "Like"} class={`:: hover:text-rose-500 transition-linear h-15 w-24 font-sitetitle animated  ${liked() ? " text-rose-500" : ""} ${animate() ? "animate-tada animate-duration-700" : ""} ${disabled() ? " cursor-not-allowed" : ""}`}>
            {liked() ?
                <IconThumbUpFilled width={36} height={36} class=":: inline lg:block mx-auto " stroke-width={1.5} />
                :
                <IconThumbUp width={36} height={36} class=":: inline lg:block mx-auto " stroke-width={1.5} />
            }
            <Suspense fallback={fallback}>
                <ErrorBoundary fallback={fallback}>
                    <Show when={resource()} fallback={fallback}>
                        <span class="<lg:px-2 inline-block align-mid">{format(likes())}</span>
                    </Show>
                </ErrorBoundary>
            </Suspense>
        </button >
    )
}

export default Like
