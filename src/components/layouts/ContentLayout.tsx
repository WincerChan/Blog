import { Accessor, JSX } from "solid-js";
import { Translations } from "~/i18n/i18n-types";
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
    extra?: JSX.Element,
    LL?: Accessor<Translations>
    lang?: string
}

const ContentLayout = ({ children, blog, headParams, lang }: ContentLayoutProps) => {
    return (
        <MainLayout className=":: xl:w-284 lg:w-220 mx-auto max-w-full ">
            <HeadTag headParams={headParams} />
            <article class=":: md:w-168 lg:w-220 xl:w-full <md:mx-4 leading-7 text-justify ">
                {children}
            </article>
        </MainLayout>
    );
};

const ArticleLayout = ({ children, headParams, extra, LL }: ContentLayoutProps) => {
    return (
        <MainLayout lang={headParams.lang}>
            <HeadTag headParams={headParams} />
            <div class="lg:grid lg:grid-cols-[1fr_auto_1fr] ">
                <ToC toc={headParams.toc} slug={headParams.pageURL} LL={LL} />
                <article class=":: md:w-168 xl:w-192 <md:mx-4 mx-auto ">
                    {children}
                </article>
                <SideBar pageURL={headParams.pageURL} LL={LL} isTranslation={headParams.isTranslation} lang={headParams.lang} />
            </div>
            <div class=":: md:w-168 xl:w-192 md:mx-auto mx-4 ">{extra}</div>
        </MainLayout>
    );
}

export default ContentLayout;
export { ArticleLayout };
