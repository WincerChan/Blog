import { JSX } from "solid-js";
import { Locale } from "~/utils/locale";
import { SideBar } from "~/features/article/sidebar";
import ToC from "~/modules/article/toc/ToC";
import HeadTag from "~/modules/site/head";
import AppLayout from "~/layouts/AppLayout";
import type { HeadParamsInput } from "~/modules/site/head/types";
import { resolveHeadParams } from "~/modules/site/head/types";

type ArticleLayoutProps = {
    children: JSX.Element;
    headParams: HeadParamsInput;
    extra?: JSX.Element;
    lang?: Locale;
};

const ArticleLayout = ({ children, headParams, extra }: ArticleLayoutProps) => {
    const resolved = resolveHeadParams(headParams);
    return (
        <AppLayout lang={resolved.lang}>
            <HeadTag headParams={headParams} />
            <div class="lg:grid lg:grid-cols-[1fr_auto_1fr] ">
                <ToC toc={resolved.toc ?? ""} slug={resolved.pageURL} />
                <article class=":: md:w-168 xl:w-192 <md:mx-4 mx-auto ">
                    {children}
                </article>
                <SideBar
                    pageURL={resolved.pageURL}
                    lang={resolved.lang}
                />
            </div>
            <div class=":: md:w-168 xl:w-192 md:mx-auto mx-4 ">{extra}</div>
        </AppLayout>
    );
};

export default ArticleLayout;
