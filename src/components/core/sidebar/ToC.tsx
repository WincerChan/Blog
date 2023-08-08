import { createSignal } from "solid-js";
import { trackEvent } from "~/utils/track";
import Seprator from "./Seprator";

const ToC = ({ toc, slug }) => {
    const [visible, setVisible] = createSignal(false);
    if (!toc) return <></>
    return (
        <>
            <button title="ToC" onClick={(e) => { setVisible(true) }} class=":: fixed md:hidden bottom-20 right-6 z-10 rounded shadow-round bg-[var(--ers-bg)] ">
                <i class=":: i-carbon-catalog w-6 h-6 m-2 text-[var(--meta-bg)] "></i>
            </button>
            <div onClick={() => { setVisible(false) }} class={`:: fixed w-full h-screen top-0 left-0 bg-[var(--meta-bg)] bg-opacity-50 ${visible() ? '' : 'hidden'} `} />
            <div id="toc" class={`:: <md:pt-4 duration-200 overflow-y-auto transition-max-height toc-responsive ${visible() ? '<md:max-h-104' : '<md:max-h-0'} `}>
                <Seprator title="目录" />
                <div onClick={() => { setVisible(false); trackEvent("Click TableofContents", { props: { slug: slug } }) }} class=":: mb-6 flex-wrap flex overflow-y-auto max-h-40vh " innerHTML={toc} />
            </div>
        </>
    )
}

export default ToC;