import { JSX, createMemo } from "solid-js";
import { Locale } from "~/utils/locale";
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
            <div class="w-full max-w-7xl mx-auto px-4 md:px-0 md:grid md:grid-cols-[minmax(0,16rem)_minmax(0,42rem)_minmax(0,16rem)] md:gap-x-8">
                <ToC toc={resolved().toc ?? ""} slug={resolved().pageURL} />
                <article class="w-full max-w-2xl mx-auto md:col-start-2 md:row-start-1">
                    {props.children}
                </article>
            </div>
            <div class="">{props.extra}</div>
        </AppLayout>
    );
};

export default ArticleLayout;
