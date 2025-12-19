import { createSignal, onCleanup, onMount } from "solid-js";
import { isBrowser } from "~/utils";
import IconUpdateNow from "~icons/carbon/update-now";

const UpdateNotify = () => {
    const forcedRefresh = isBrowser ? window.location.reload.bind(window.location) : () => { }
    const [visible, setVisible] = createSignal(false);

    onMount(() => {
        const showNotify = () => {
            setVisible(true);
            setTimeout(() => setVisible(false), 5000);
        };
        window.addEventListener("sw:update-ready", showNotify);
        onCleanup(() => window.removeEventListener("sw:update-ready", showNotify));
    });
    return (
        <button
            id="sw-notify"
            onClick={forcedRefresh}
            class=":: fixed bottom-0 py-6 md:py-4 md:bottom-10 md:left-10 z-10 p-2 rounded bg-[var(--menu-hover-text)] text-[var(--menu-hover-bg)] w-full md:w-auto "
            classList={{ hidden: !visible() }}
        >
            <IconUpdateNow width={20} height={20} class=":: inline mr-2 ml-1 " />
            更新已就绪，刷新页面以查看新内容。
        </button>
    )
}

export default UpdateNotify
