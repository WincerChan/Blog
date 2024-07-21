import { isBrowser } from "~/utils";
import IconUpdateNow from "~icons/carbon/update-now";

const UpdateNotify = () => {
    const forcedRefresh = isBrowser ? window.location.reload.bind(window.location) : () => { }
    return (
        <button id="sw-notify" onClick={forcedRefresh} class=":: fixed hidden bottom-0 py-6 md:py-4 md:bottom-10 md:left-10 z-10 p-2 rounded bg-[var(--menu-hover-text)] text-[var(--menu-hover-bg)] w-full md:w-auto ">
            <IconUpdateNow width={20} height={20} class=":: inline mr-2 ml-1 " />
            更新已就绪，刷新页面以查看新内容。
        </button>
    )
}

export default UpdateNotify