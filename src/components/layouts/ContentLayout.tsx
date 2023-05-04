import { JSX } from "solid-js";
import { HeadParamsTyoe } from "~/schema/Head";
import Footer from "../core/footer";
import BackTop from "../core/footer/backTop";
import Header from "../core/header";
import { BlogSideBar, SideBar } from "../core/sidebar";
import { BlogPostParams } from "../core/sidebar/types";

type ContentLayoutProps = {
    blog?: BlogPostParams,
    children: JSX.Element,
    headParams: HeadParamsTyoe
}

const ContentLayout = ({ children, blog, headParams }: ContentLayoutProps) => {
    return (
        <>
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