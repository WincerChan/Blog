import { useBeforeLeave } from "@solidjs/router";
import nProgress from "nprogress";
import { JSX, createMemo, onMount } from "solid-js";
import { useIsRouting, useLocation } from "solid-start";
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
    const location = useLocation()
    const hash = createMemo(() => location.hash);
    const pathname = createMemo(() => location.pathname);
    const isRouting = useIsRouting()
    useBeforeLeave(e => {
        nProgress.start()
    })
    onMount(() => {
        nProgress.done()
    })
    // createEffect(() => {
    //     if (isRouting()) nProgress.start()
    // })
    // createEffect(() => {
    //     console.log("hash changed", hash())
    // })
    // createEffect(() => {
    //     console.log("path changed", pathname())
    // })
    // createEffect(() => {
    //     if (pathname === val.location) nProgress.done()
    //     console.log("path", pathname, val.location)
    // })
    return (
        <>
            <HeadTag headParams={headParams} />
            <Header />
            <main class="w-view md:grid grid-cols-50 md:mx-4 lg:mx-auto">
                <article class="mb-4 2xl:col-span-37 leading-7 col-span-36 md:mr-4 lg:mr-8 text-justify">
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