import { JSX, createMemo } from "solid-js";
import { Locale } from "~/utils/locale";
import { SideBar } from "~/features/article/sidebar";
import ToC from "~/features/article/components/ToC";
import HeadTag from "~/site/seo";
import AppLayout from "~/layouts/AppLayout";
import type { HeadParamsInput } from "~/site/seo/types";
import { resolveHeadParams } from "~/site/seo/types";

type ArticleLayoutProps = {
    children: JSX.Element;
    headParams: HeadParamsInput;
    extra?: JSX.Element;
    lang?: Locale;
};

const ArticleLayout = (props: ArticleLayoutProps) => {
    const resolved = createMemo(() => resolveHeadParams(props.headParams));
    return (
        <AppLayout lang={resolved().lang}>
            <HeadTag headParams={props.headParams} />
            <div class="lg:grid lg:grid-cols-[1fr_auto_1fr] ">
                <ToC toc={resolved().toc ?? ""} slug={resolved().pageURL} />
                <article class=":: md:w-168 xl:w-192 <md:mx-4 mx-auto ">
                    {props.children}
                </article>
                <SideBar
                    pageURL={resolved().pageURL}
                    lang={resolved().lang}
                />
            </div>
            <div class=":: md:w-168 xl:w-192 md:mx-auto mx-4 ">{props.extra}</div>
        </AppLayout>
    );
};

export default ArticleLayout;
