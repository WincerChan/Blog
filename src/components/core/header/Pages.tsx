import { For, createMemo } from "solid-js";
import { useI18nContext } from "~/i18n/i18n-solid";

type PagesProps = {
    rawPages: {
        slug: string;
        title: string;
    }[];
};

const Pages = () => {
    const { LL, locale } = useI18nContext();
    let pages = createMemo(() => (locale() === "zh-CN" ? __ZH_NAV : __EN_NAV));
    return (
        <ul class="flex overflow-x-auto">
            <For each={pages()}>
                {(pageEntry, idx) => (
                    <li>
                        <a
                            href={`/${pageEntry}/`}
                            class=":: h-12 sm:h-16 px[12px] sm:px[14px] lg:px-6 flex inline-block items-center hover:bg-menu md:text-lg hover:text-menu-transition transition-linear capitalize min-w-14"
                        >
                            {LL().header.NAV[idx()]()}
                        </a>
                    </li>
                )}
            </For>
        </ul>
    );
};
export default Pages;
