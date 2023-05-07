import { useBeforeLeave } from "@solidjs/router";
import nProgress from "nprogress";
import { JSX, onMount } from "solid-js";
import { HeadParamsTyoe } from "~/schema/Head";
import Footer from "../core/footer";
import BackTop from "../core/footer/backTop";
import Header from "../core/header";
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
            <Header />
            <main class=":: w-view main-responsive grid-cols-50 ">
                <article class=":: mb-4 article-responsive leading-7 text-justify ">
                    {children}
                </article>
                {blog ? <BlogSideBar blog={blog} /> : <SideBar />}
            </main>
            <Footer />
            <BackTop />
        </>
    );
};

export default ContentLayout;