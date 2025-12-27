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
            <div class="w-full max-w-5xl mx-auto px-4 md:px-0">
                <ToC toc={resolved().toc ?? ""} slug={resolved().pageURL} />
                <article class="w-full max-w-2xl">
                    {props.children}
                </article>
                <SideBar
                    pageURL={resolved().pageURL}
                    lang={resolved().lang}
                />
            </div>
            <div class="">{props.extra}</div>
        </AppLayout>
    );
};

export default ArticleLayout;
