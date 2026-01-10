import { Show, createSignal } from "solid-js";
import IconBrandTwitter from "~icons/ph/twitter-logo";
import IconLink from "~icons/ph/link-simple";
import IconCheck from "~icons/ph/check";
import { useI18nContext } from "~/i18n/i18n-solid";
import Like from "~/features/article/sidebar/social/Like";
import { writeClipboardText } from "~/utils/clipboard";

const PostActions = ({ pageURL }: { pageURL: string }) => {
    const { LL } = useI18nContext();
    const buildShareUrl = () =>
        typeof window !== "undefined" ? window.location.href : pageURL;
    const twitterShareUrl = () =>
        `https://twitter.com/intent/tweet?url=${encodeURIComponent(buildShareUrl())}`;
    const [copied, setCopied] = createSignal(false);
    let resetTimer: number | undefined;
    const copyUrl = async () => {
        try {
            const ok = await writeClipboardText(buildShareUrl());
            if (!ok) return;
            setCopied(true);
            if (resetTimer) window.clearTimeout(resetTimer);
            resetTimer = window.setTimeout(() => setCopied(false), 2000);
        } catch {
            // ignore clipboard errors
        }
    };
    return (
        <div class="my-10 flex items-center justify-between border-y border-dashed border-[var(--c-border)] py-6">
            <Like pageURL={pageURL} />
            <div class="flex items-center gap-4">
                <span class="text-sm text-[var(--c-text-subtle)]">
                    {LL().sidebar.TOOLS.share.title()}
                </span>
                <a
                    href={twitterShareUrl()}
                    title="Share on Twitter"
                    target="_blank"
                    rel="noopener"
                    class="inline-flex items-center justify-center text-[var(--c-text-muted)] transition-colors hover:text-[var(--c-link)]"
                >
                    <IconBrandTwitter width={26} height={26} class="block" />
                </a>
                <button
                    type="button"
                    title="Copy URL"
                    onClick={copyUrl}
                    class="inline-flex items-center justify-center text-[var(--c-text-muted)] transition-colors hover:text-[var(--c-link)]"
                >
                    <Show
                        when={copied()}
                        fallback={<IconLink width={26} height={26} class="block transition-opacity duration-200 ease-out" />}
                    >
                        <IconCheck width={26} height={26} class="block text-green-600 transition-opacity duration-200 ease-out" />
                    </Show>
                </button>
            </div>
        </div>
    );
};

export default PostActions;
