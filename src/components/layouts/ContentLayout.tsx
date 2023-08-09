import { useBeforeLeave } from "@solidjs/router";
import nProgress from "nprogress";
import { JSX, onMount } from "solid-js";
import { HeadParamsTyoe } from "~/schema/Head";
import { trackPageview } from "~/utils/track";
import ToC from "../core/sidebar/ToC";
import { BlogPostParams } from "../core/sidebar/types";
import HeadTag from "../head";
nProgress.configure({ showSpinner: false, speed: 200, trickleSpeed: 50 })

type ContentLayoutProps = {
    blog?: BlogPostParams,
    children: JSX.Element,
    headParams: HeadParamsTyoe
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
            {/* {blog ? <BlogSideBar blog={blog} /> : <SideBar />} */}
        </main>
    );
};

const ArticleLayout = ({ children, blog, headParams }: ContentLayoutProps) => {
    useBeforeLeave(e => {
        if (!(e.to.toString().startsWith(e.from.pathname) && e.from.pathname !== "/")) nProgress.start()
        trackPageview({ url: `${window.location.origin}${e.to.toString()}` })
    })
    onMount(() => {
        nProgress.done()
    })
    return (
        <main class="lg:grid lg:grid-cols-[1fr_auto_1fr] ">
            <HeadTag headParams={headParams} />
            <div />
            <article class=":: md:w-168 xl:w-192 mx-auto ">
                {children}
            </article>
            <ToC {...blog} slug={headParams.pageURL} />
        </main>
    );
}

export default ContentLayout;
export { ArticleLayout };
