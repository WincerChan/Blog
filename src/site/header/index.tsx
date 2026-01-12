import { Show, createEffect, createSignal, onCleanup } from "solid-js";
import { isBrowser } from "~/utils";
import IconMenu2 from "~icons/ph/list";
import IconX from "~icons/ph/x";
import IconRSS from "~icons/ph/rss";
import Logo from "./Logo";
import Pages from "./Pages";
import Tools from "./Tools";

const Header = () => {
    const [menuOpen, setMenuOpen] = createSignal(false);

    createEffect(() => {
        if (!isBrowser) return;
        document.body.style.overflow = menuOpen() ? "hidden" : "";
    });

    onCleanup(() => {
        if (!isBrowser) return;
        document.body.style.overflow = "";
    });

    const closeMenu = () => setMenuOpen(false);
    return (
        <>
            <header class="sticky top-0 z-40 w-full bg-[var(--c-bg-glass)] backdrop-blur-sm border-b border-[var(--c-border)]">
                <div class="w-full max-w-5xl mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between gap-6">
                    <div class="flex items-center gap-9">
                        <Logo />
                        <nav class="hidden md:flex items-center gap-7 text-base">
                            <Pages />
                        </nav>
                    </div>
                    <div class="flex items-center gap-6">
                        <Tools />
                        <button
                            type="button"
                            aria-label={menuOpen() ? "Close menu" : "Menu"}
                            aria-expanded={menuOpen()}
                            onClick={() => setMenuOpen(!menuOpen())}
                            class="md:hidden inline-flex items-center justify-center text-[var(--c-text-muted)] hover:text-[var(--c-link)] transition-colors"
                        >
                            <Show when={menuOpen()} fallback={<IconMenu2 width={22} height={22} class="block transition-colors" />}>
                                <IconX width={22} height={22} class="block transition-colors" />
                            </Show>
                        </button>
                    </div>
                </div>
            </header>
            <Show when={menuOpen()}>
                <div class="fixed inset-x-0 bottom-0 top-14 md:top-16 z-50 bg-[var(--c-bg)] text-[var(--c-text)]">
                    <div class="w-full max-w-5xl mx-auto px-6">
                        <div class="py-10 flex flex-col gap-10">
                            <nav class="flex flex-col gap-5 text-2xl font-sans font-medium text-[var(--c-text)]">
                                <Pages
                                    class="group flex items-center justify-between border-b border-[var(--c-border)] pb-3 text-[var(--c-text)] transition-colors hover:text-[var(--c-link)] last:border-b-0 last:pb-0"
                                    onClick={closeMenu}
                                    showSuffixIcon={true}
                                />
                            </nav>
                            <div class="flex items-center gap-3 text-lg text-[var(--c-text-muted)]">
                                <a
                                    href="/atom.xml"
                                    target="_blank"
                                    class="inline-flex items-center gap-2 transition-colors hover:text-[var(--c-link)]"
                                    onClick={closeMenu}
                                >
                                    <IconRSS width={18} height={18} class="block" />
                                    RSS
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </Show>
        </>
    );
};

export default Header;
