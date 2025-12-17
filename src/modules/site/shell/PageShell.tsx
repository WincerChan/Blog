import { JSX } from "solid-js";
import { Locale } from "~/utils/locale";
import HeadTag from "~/modules/site/head";
import AppShell from "./AppShell";
import type { HeadParamsInput } from "~/modules/site/head/types";

type PageShellProps = {
    children: JSX.Element;
    headParams: HeadParamsInput;
    lang?: Locale;
};

const PageShell = ({ children, headParams, lang }: PageShellProps) => {
    return (
        <AppShell className=":: xl:w-284 lg:w-220 mx-auto max-w-full " lang={lang}>
            <HeadTag headParams={headParams} />
            <article class=":: md:w-168 lg:w-220 xl:w-full <md:mx-4 leading-7 text-justify ">
                {children}
            </article>
        </AppShell>
    );
};

export default PageShell;
