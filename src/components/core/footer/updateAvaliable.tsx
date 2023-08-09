import { isBrowser } from "~/utils";

const UpdateNotify = () => {
    const forcedRefresh = isBrowser ? window.location.reload.bind(window.location) : () => { }
    return (
        <button id="sw-notify" onClick={forcedRefresh} class=":: fixed hidden bottom-0 py-6 notify-responsive z-10 p-2 rounded bg-[var(--menu-hover-text)] text-[var(--menu-hover-bg)] ">
            <i class=":: mr-2 ml-1 i-carbon-update-now h-5 w-5 " />
            更新已就绪，刷新页面以查看新内容。
        </button>
    )
}

export default UpdateNotify