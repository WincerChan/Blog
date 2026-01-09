import { ErrorBoundary, Show, Suspense, createEffect, createResource, createSignal, onCleanup, onMount } from "solid-js";
import { fetcher } from "~/utils";
import { inkstoneApi } from "~/utils/inkstone";
import IconHeart from "~icons/ph/heart";
import IconHeartFill from "~icons/ph/heart-fill";
import { normalizeKudosPath } from "./kudos";

interface LikeProps {
    pageURL: string;
}

const Like = ({ pageURL }: LikeProps) => {
    const [liked, setLiked] = createSignal(false)
    const [likes, setLikes] = createSignal(0)
    const [disabled, setDisabled] = createSignal(false)
    const [visible, setVisible] = createSignal(false)
    const [url, setUrl] = createSignal<string | null>(null)
    const fetchKudos = async (targetUrl: string | null) => {
        if (!targetUrl) return null;
        try {
            const resp = await fetch(targetUrl, { credentials: "include" })
            if (!resp.ok) return null;
            return await resp.json();
        } catch {
            return null;
        }
    }
    const [resource] = createResource(url, fetchKudos)
    const [animate, setAnimate] = createSignal(false)
    const buildKudosUrl = (path: string) => {
        const base = inkstoneApi("kudos")
        const target = new URL(base)
        target.searchParams.set("path", path)
        return target.toString()
    }
    let buttonRef: HTMLButtonElement | undefined;
    onMount(() => {
        if (!buttonRef || typeof IntersectionObserver === "undefined") {
            setVisible(true);
            return;
        }
        const observer = new IntersectionObserver(entries => {
            if (entries[0]?.isIntersecting) {
                setVisible(true);
                observer.disconnect();
            }
        })
        observer.observe(buttonRef);
        onCleanup(() => observer.disconnect());
    })
    createEffect(() => {
        if (!visible()) {
            setUrl(null);
            return;
        }
        const slug = normalizeKudosPath(pageURL);
        if (!slug) {
            setUrl(null);
            return;
        }
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
        if (!data || typeof data !== "object") return;
        if (typeof data.count === "number") setLikes(data.count)
        if (typeof data.interacted === "boolean") {
            setLiked(data.interacted)
            if (data.interacted) setDisabled(true)
        }
    })
    const fallback = <span class="">-</span>
    return (
        <button
            ref={buttonRef}
            disabled={disabled()}
            onClick={click}
            title={liked() ? `${likes()} 人已点赞` : "Like"}
            class="inline-flex items-center gap-2 text-sm text-[var(--c-text-muted)] transition-colors hover:text-red-600 disabled:cursor-not-allowed"
            classList={{ "text-red-600": liked() }}
        >
            <Show
                when={liked()}
                fallback={<IconHeart width={26} height={26} class="block transition-colors" />}
            >
                <IconHeartFill width={26} height={26} class="block transition-colors" />
            </Show>
            <Suspense fallback={fallback}>
                <ErrorBoundary fallback={fallback}>
                    <Show when={resource()} fallback={fallback}>
                        <span class="tabular-nums">{format(likes())}</span>
                    </Show>
                </ErrorBoundary>
            </Suspense>
        </button>
    )
}

export default Like
