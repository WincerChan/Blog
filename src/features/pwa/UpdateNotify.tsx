import { createSignal, onCleanup, onMount } from "solid-js";
import { isBrowser } from "~/utils";
import IconRefresh from "~icons/ph/arrow-clockwise";

const UpdateNotify = () => {
    const forcedRefresh = isBrowser ? window.location.reload.bind(window.location) : () => { }
    const [visible, setVisible] = createSignal(false);

    const requestUpdate = async () => {
        if (!isBrowser || !("serviceWorker" in navigator)) return;
        const reg = await navigator.serviceWorker.getRegistration();
        if (!reg?.waiting) {
            forcedRefresh();
            return;
        }
        const onControllerChange = () => {
            forcedRefresh();
        };
        navigator.serviceWorker.addEventListener("controllerchange", onControllerChange, { once: true });
        reg.waiting.postMessage({ type: "SKIP_WAITING" });
        setVisible(false);
    };

    onMount(() => {
        const showNotify = () => {
            setVisible(true);
        };
        window.addEventListener("sw:update-ready", showNotify);
        onCleanup(() => window.removeEventListener("sw:update-ready", showNotify));
    });
    return (
        <button
            id="sw-notify"
            onClick={requestUpdate}
            type="button"
            class="group fixed bottom-6 left-6 z-50 inline-flex items-center gap-3 rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] px-5 py-4 text-sm leading-relaxed text-[var(--c-text)] transition-colors hover:border-[var(--c-border-strong)] hover:text-[var(--c-link)]"
            classList={{ hidden: !visible() }}
        >
            <div class="relative flex h-2.5 w-2.5 shrink-0 items-center justify-center">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--c-link)] opacity-70"></span>
                <span class="relative inline-flex h-2 w-2 rounded-full bg-[var(--c-link)]"></span>
            </div>
            <span class="flex-1 font-sans text-[0.9rem] ml-1">更新已就绪，刷新页面以查看新内容。</span>
            <IconRefresh width={20} height={20} class="shrink-0 text-[var(--c-text-muted)] transition-colors group-hover:text-[var(--c-link)]" />
        </button>
    )
}

export default UpdateNotify
