import { Accessor, JSX } from "solid-js";
import { Translations } from "~/i18n/i18n-types";
import { HeadParamsTyoe } from "~/schema/Head";
import { Locale } from "~/utils/locale";
import { SideBar } from "~/modules/article/sidebar";
import ToC from "~/modules/article/toc/ToC";
import HeadTag from "~/modules/site/head";
import AppShell from "~/modules/site/shell/AppShell";

type ArticleShellProps = {
    children: JSX.Element;
    headParams: HeadParamsTyoe;
    extra?: JSX.Element;
    LL?: Accessor<Translations>;
    lang?: Locale;
};

const ArticleShell = ({ children, headParams, extra, LL }: ArticleShellProps) => {
    return (
        <AppShell lang={headParams.lang}>
            <HeadTag headParams={headParams} />
            <div class="lg:grid lg:grid-cols-[1fr_auto_1fr] ">
                <ToC toc={headParams.toc} slug={headParams.pageURL} />
                <article class=":: md:w-168 xl:w-192 <md:mx-4 mx-auto ">
                    {children}
                </article>
                <SideBar
                    pageURL={headParams.pageURL}
                    LL={LL}
                    isTranslation={headParams.isTranslation}
                    lang={headParams.lang}
                />
            </div>
            <div class=":: md:w-168 xl:w-192 md:mx-auto mx-4 ">{extra}</div>
        </AppShell>
    );
};

export default ArticleShell;
