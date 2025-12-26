import { JSX } from "solid-js";
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
    return (
        <AppLayout
            className=""
            lang={props.lang}
        >
            <HeadTag headParams={props.headParams} />
            <article class="">
                {props.children}
            </article>
        </AppLayout>
    );
};

export default PageLayout;
