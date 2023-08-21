import { useBeforeLeave } from "@solidjs/router";
import nProgress from "nprogress";
import { JSX, onMount } from "solid-js";
import { HeadParamsTyoe } from "~/schema/Head";
import { trackPageview } from "~/utils/track";
import { SideBar } from "../core/sidebar";
import ToC from "../core/sidebar/ToC";
import { BlogPostParams } from "../core/sidebar/types";
import HeadTag from "../head";
nProgress.configure({ showSpinner: false, speed: 200, trickleSpeed: 50 })

type ContentLayoutProps = {
    blog?: BlogPostParams,
    children: JSX.Element,
    headParams: HeadParamsTyoe,
    extra?: JSX.Element
}

const ContentLayout = ({ children, blog, headParams }: ContentLayoutProps) => {
    useBeforeLeave(e => {
        if (!(e.to.toString().startsWith(e.from.pathname) && e.from.pathname !== "/")) nProgress.start()
        trackPageview({ url: `${window.location.origin}${e.to.toString()}` })
    })
    onMount(() => {
        nProgress.done()
    })
    return (
        <main class="w-view">
            <HeadTag headParams={headParams} />
            <article class={`:: md:w-168 lg:w-220 xl:w-full w-full mx-auto leading-7 text-justify`}>
                {children}
            </article>
        </main>
    );
};

const ArticleLayout = ({ children, blog, headParams, extra }: ContentLayoutProps) => {
    useBeforeLeave(e => {
        if (!(e.to.toString().startsWith(e.from.pathname) && e.from.pathname !== "/")) nProgress.start()
        trackPageview({ url: `${window.location.origin}${e.to.toString()}` })
    })
    onMount(() => {
        nProgress.done()
    })
    return (
        <main class="">
            <HeadTag headParams={headParams} />
            <div class="grid lg:grid-cols-[1fr_auto_1fr] ">
                <SideBar params={headParams} />
                <article class=":: md:w-168 xl:w-192 mx-auto <md:w-100vw <lg:order-first ">
                    {children}
                </article>
                <ToC {...blog} slug={headParams.pageURL} />
            </div>
            {<div class="content-width">{extra}</div>}
        </main>
    );
}

export default ContentLayout;
export { ArticleLayout };
