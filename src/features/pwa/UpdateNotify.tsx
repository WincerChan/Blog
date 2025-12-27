import { createSignal, onCleanup, onMount } from "solid-js";
import { isBrowser } from "~/utils";
import IconRefresh from "~icons/tabler/refresh";

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
            class=""
            classList={{ hidden: !visible() }}
        >
            <IconRefresh width={20} height={20} class="" />
            更新已就绪，刷新页面以查看新内容。
        </button>
    )
}

export default UpdateNotify
