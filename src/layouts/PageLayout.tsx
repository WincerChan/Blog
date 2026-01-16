import { JSX, createMemo } from "solid-js";
import { Locale } from "~/utils/locale";
import HeadTag from "~/site/seo";
import AppLayout from "./AppLayout";
import type { HeadParamsInput } from "~/site/seo/types";
import { resolveHeadParams } from "~/site/seo/types";

type PageLayoutProps = {
    children: JSX.Element;
    headParams: HeadParamsInput;
    lang?: Locale;
};

const PageLayout = (props: PageLayoutProps) => {
    const resolved = createMemo(() => resolveHeadParams(props.headParams));
    return (
        <AppLayout
            className=""
            lang={props.lang}
            inkstoneToken={resolved().inkstoneToken}
        >
            <HeadTag headParams={props.headParams} />
            <article class="w-full max-w-2xl mx-auto px-4 md:px-0">
                {props.children}
            </article>
        </AppLayout>
    );
};

export default PageLayout;
