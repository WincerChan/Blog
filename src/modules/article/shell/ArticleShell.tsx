import { Accessor, JSX } from "solid-js";
import { Translations } from "~/i18n/i18n-types";
import { Locale } from "~/utils/locale";
import { SideBar } from "~/modules/article/sidebar";
import ToC from "~/modules/article/toc/ToC";
import HeadTag from "~/modules/site/head";
import AppShell from "~/modules/site/shell/AppShell";
import type { HeadParamsInput } from "~/modules/site/head/types";
import { resolveHeadParams } from "~/modules/site/head/types";

type ArticleShellProps = {
    children: JSX.Element;
    headParams: HeadParamsInput;
    extra?: JSX.Element;
    LL?: Accessor<Translations>;
    lang?: Locale;
};

const ArticleShell = ({ children, headParams, extra, LL }: ArticleShellProps) => {
    const resolved = resolveHeadParams(headParams);
    return (
        <AppShell lang={resolved.lang}>
            <HeadTag headParams={headParams} />
            <div class="lg:grid lg:grid-cols-[1fr_auto_1fr] ">
                <ToC toc={resolved.toc ?? ""} slug={resolved.pageURL} />
                <article class=":: md:w-168 xl:w-192 <md:mx-4 mx-auto ">
                    {children}
                </article>
                <SideBar
                    pageURL={resolved.pageURL}
                    LL={LL}
                    isTranslation={resolved.isTranslation}
                    lang={resolved.lang}
                />
            </div>
            <div class=":: md:w-168 xl:w-192 md:mx-auto mx-4 ">{extra}</div>
        </AppShell>
    );
};

export default ArticleShell;
