import { createSignal } from "solid-js";
import Seprator from "./Seprator";
import { BlogPostParams } from "./types";

const ToC = ({ toc }: BlogPostParams) => {
    const [visible, setVisible] = createSignal(false);
    return (
        <>
            <button title="ToC" onClick={(e) => { setVisible(true) }} class=":: fixed md:hidden bottom-20 right-6 z-10 rounded shadow-round bg-[var(--ers-bg)] ">
                <i class=":: i-carbon-catalog w-6 h-6 m-2 text-[var(--meta-bg)] "></i>
            </button>
            <div onClick={() => { setVisible(false) }} class={`:: fixed w-full h-screen top-0 left-0 bg-[var(--meta-bg)] bg-opacity-50 ${visible() ? '' : 'hidden'} `} />
            <div id="toc" class={`:: duration-200 overflow-y-auto transition-max-height toc-responsive ${visible() ? '<md:max-h-104' : '<md:max-h-0'} `}>
                <Seprator title="目录" />
                <div onClick={() => setVisible(false)} class=":: mb-6 flex-wrap flex overflow-y-auto md:max-h-82 " innerHTML={toc} />

            </div>
        </>
    )
}

export default ToC;