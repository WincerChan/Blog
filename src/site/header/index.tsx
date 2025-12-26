import Logo from "./Logo";
import Pages from "./Pages";
import Tools from "./Tools";

const Header = () => {
    return (
        <header class="sticky top-0 z-40 w-full bg-[var(--c-bg-glass)] backdrop-blur-sm border-b border-[var(--c-border)]">
            <div class="w-full max-w-5xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-6">
                <div class="flex items-center gap-8">
                    <Logo />
                    <nav class="flex items-center gap-6 text-base">
                        <Pages />
                    </nav>
                </div>
                <Tools />
            </div>
        </header>
    );
};

export default Header;
