import { createSignal } from "solid-js";
import Seprator from "./Seprator";
import { BlogPostParams } from "./types";

const ToC = ({ toc }: BlogPostParams) => {
    const [visible, setVisible] = createSignal(false);
    return (
        <>
            <button onClick={(e) => { setVisible(true) }} class="fixed md:hidden bottom-20 right-6 z-10 rounded shadow-round bg-[var(--ers-bg)]">
                <i class="i-carbon-catalog w-6 h-6 m-2 text-[var(--meta-bg)]"></i>
            </button>
            <div onClick={() => { setVisible(false) }} class={`${visible() ? '' : 'hidden'} fixed w-full h-screen top-0 left-0 bg-[var(--meta-bg)] bg-opacity-50`} />
            <div id="toc" class={`${visible() ? '<md:max-h-104' : '<md:max-h-0'} duration-200 overflow-y-auto transition-max-height <md:fixed <md:bottom-5 <md:w-full <md:bg-[var(--ers-bg)] <md:z-20 <md:px-4`}>
                <Seprator title="目录" />
                <div onClick={() => setVisible(false)} class="mb-6 flex-wrap flex md:max-h-82 overflow-y-auto" innerHTML={toc} />

            </div>
        </>
    )
}

export default ToC;