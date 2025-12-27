import { ErrorBoundary, Show, Suspense, createEffect, createResource, createSignal, onMount } from "solid-js";
import { fetcher } from "~/utils";
import { inkstoneApi } from "~/utils/inkstone";
import IconHeart from "~icons/tabler/heart";
import IconHeartFilled from "~icons/tabler/heart-filled";


const Like = ({ pageURL }) => {
    const [liked, setLiked] = createSignal(false)
    const [likes, setLikes] = createSignal(0)
    const [disabled, setDisabled] = createSignal(false)
    const [url, setUrl] = createSignal()
    const fetchKudos = async (targetUrl: string) => {
        const resp = await fetch(targetUrl, { credentials: "include" })
        if (!resp.ok) throw new Error(resp.statusText)
        return resp.json()
    }
    const [resource] = createResource(url, fetchKudos)
    const [animate, setAnimate] = createSignal(false)
    const buildKudosUrl = (path: string) => {
        const base = inkstoneApi("kudos")
        const target = new URL(base)
        target.searchParams.set("path", path)
        return target.toString()
    }
    onMount(() => {
        let slug = pageURL;
        if (pageURL.endsWith("-zh/")) slug = pageURL.replace("-zh/", "/")
        if (pageURL.endsWith("-en/")) slug = pageURL.replace("-en/", "/")
        setUrl(buildKudosUrl(slug))
    })
    const click = async () => {
        if (!url()) return
        setDisabled(true)
        try {
            const resp = await fetch(url(), { method: "PUT", credentials: "include" })
            if (!resp.ok) {
                setDisabled(false)
                return
            }
            const payload = await resp.json().catch(() => ({}))
            const nextCount = typeof payload?.count === "number" ? payload.count : likes() + 1
            setLikes(nextCount)
            setLiked(true)
            setAnimate(true)
        } catch (error) {
            console.error(error)
            setDisabled(false)
        }
    }
    const format = (number) => {
        if (number < 1000) return number; // Return the number itself if it's less than 1000
        return (number / 1000).toFixed(1) + 'K'; // Return the number in "K" format if it's less than a million
        // You can continue with more conditions for millions, billions, etc.
    }
    createEffect(() => {
        const data = resource()
        if (data) {
            if (typeof data.count === "number") setLikes(data.count)
            if (typeof data.interacted === "boolean") {
                setLiked(data.interacted)
                if (data.interacted) setDisabled(true)
            }
        } else if (data !== undefined) {
            setDisabled(true)
        }
    })
    const fallback = <span class="">-</span>
    return (
        <button disabled={disabled()} onClick={click} title={liked() ? `${likes()} 人已点赞` : "Like"} class="">
            {liked() ?
                <IconHeartFilled width={36} height={36} class="" stroke-width={1.5} />
                :
                <IconHeart width={36} height={36} class="" stroke-width={1.5} />
            }
            <Suspense fallback={fallback}>
                <ErrorBoundary fallback={fallback}>
                    <Show when={resource()} fallback={fallback}>
                        <span class="">{format(likes())}</span>
                    </Show>
                </ErrorBoundary>
            </Suspense>
        </button >
    )
}

export default Like
