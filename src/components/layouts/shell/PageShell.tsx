import { JSX } from "solid-js";
import { HeadParamsTyoe } from "~/schema/Head";
import { Locale } from "~/utils/locale";
import HeadTag from "~/components/head";
import AppShell from "./AppShell";

type PageShellProps = {
    children: JSX.Element;
    headParams: HeadParamsTyoe;
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
