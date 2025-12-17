export const shortcuts = {
    "transition-linear": "transition duration-100 ease-linear",
    "text-menu-accent": "text-menu-active underline underline-1 underline-offset-4",
    "mobile-full-bleed": " <md:w-[calc(100%+2rem)] <md:max-w-none <md:-ml-4 ",
    "menu-item-hover": "hover:bg-menu transition-linear hover:text-menu-accent ",
    "text-link":
        "shadow-[0_-0.05rem_0_var(--menu-hover-text)_inset] hover:shadow-[0_-1.3rem_0_var(--menu-hover-text)_inset] text-[var(--menu-hover-text)] hover:text-[var(--menu-hover-bg)] ",
    "toc-modal": "<lg:fixed <lg:bottom-0 <lg:w-full <lg:bg-surface <lg:px-4",
    "text-headline": "font-headline font-semibold leading-relaxed md:leading-loose md:text-3xl text-[1.7rem]",
} as const;
