import { JSX } from "solid-js";
import { HeadParamsTyoe } from "~/schema/Head";
import { SideBar } from "../core/sidebar";
import ToC from "../core/sidebar/ToC";
import { BlogPostParams } from "../core/sidebar/types";
import HeadTag from "../head";
import MainLayout from "./MainLayout";

type ContentLayoutProps = {
    blog?: BlogPostParams,
    children: JSX.Element,
    headParams: HeadParamsTyoe,
    extra?: JSX.Element
}

const ContentLayout = ({ children, blog, headParams }: ContentLayoutProps) => {
    return (
        <MainLayout className="w-view">
            <HeadTag headParams={headParams} />
            <article class={`:: md:w-168 lg:w-220 xl:w-full w-full mx-auto <md:w-[calc(100vw-32px)] leading-7 text-justify`}>
                {children}
            </article>
        </MainLayout>
    );
};

const ArticleLayout = ({ children, blog, headParams, extra }: ContentLayoutProps) => {
    return (
        <MainLayout lang={headParams.lang}>
            <HeadTag headParams={headParams} />
            <div class="grid lg:grid-cols-[1fr_auto_1fr] ">
                <SideBar pageURL={headParams.pageURL} lang={headParams.lang || 'zh-CN'} secondaryLang={headParams.secondaryLang} />
                <article class=":: md:w-168 xl:w-192 mx-auto <md:w-[calc(100vw-32px)] <lg:order-first ">
                    {children}
                </article>
                <ToC toc={blog?.toc} slug={headParams.pageURL} />
            </div>
            {<div class="content-width">{extra}</div>}
        </MainLayout>
    );
}

export default ContentLayout;
export { ArticleLayout };
