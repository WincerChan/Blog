import { useLocation } from "@solidjs/router";
import { JSX, Show, createMemo } from "solid-js";
import { Locale } from "~/utils/locale";
import HeadTag from "~/site/seo";
import AppLayout from "./AppLayout";
import type { HeadParamsInput } from "~/site/seo/types";

type PageLayoutProps = {
    children: JSX.Element;
    headParams: HeadParamsInput;
    lang?: Locale;
};

const PageLayout = (props: PageLayoutProps) => {
    const location = useLocation();
    const headKey = createMemo(() => `${location.pathname}${location.search}`);
    return (
        <AppLayout
            className=":: xl:w-284 lg:w-220 mx-auto max-w-full "
            lang={props.lang}
        >
            <Show keyed when={headKey()}>
                {() => <HeadTag headParams={props.headParams} />}
            </Show>
            <article class=":: md:w-168 lg:w-220 xl:w-full <md:mx-4 leading-7 text-justify ">
                {props.children}
            </article>
        </AppLayout>
    );
};

export default PageLayout;
