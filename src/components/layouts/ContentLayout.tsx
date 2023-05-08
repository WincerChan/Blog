import { useBeforeLeave } from "@solidjs/router";
import nProgress from "nprogress";
import { JSX, onMount } from "solid-js";
import { HeadParamsTyoe } from "~/schema/Head";
import { BlogSideBar, SideBar } from "../core/sidebar";
import { BlogPostParams } from "../core/sidebar/types";
import HeadTag from "../head";
nProgress.configure({ showSpinner: false })

type ContentLayoutProps = {
    blog?: BlogPostParams,
    children: JSX.Element,
    headParams: HeadParamsTyoe
}

const ContentLayout = ({ children, blog, headParams }: ContentLayoutProps) => {
    useBeforeLeave(e => {
        if (!(e.to.toString().startsWith(e.from.pathname) && e.from.pathname !== "/")) nProgress.start()
    })
    onMount(() => {
        nProgress.done()
    })
    return (
        <>
            <HeadTag headParams={headParams} />
            <article class=":: mb-4 article-responsive leading-7 text-justify ">
                {children}
            </article>
            {blog ? <BlogSideBar blog={blog} /> : <SideBar />}
        </>
    );
};

export default ContentLayout;