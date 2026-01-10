import { Show, createSignal, onCleanup } from "solid-js";
import { render } from "solid-js/web";
import IconCodeBlock from "~icons/ph/code-block";
import IconCopy from "~icons/ph/copy";
import IconCheck from "~icons/ph/check";
import { writeClipboardText } from "~/utils/clipboard";

export const normalizeLangLabel = (value: string | null) => {
    const trimmed = String(value ?? "").trim();
    return trimmed ? trimmed.toLowerCase() : "text";
};

export const resolveCopyLabel = (
    copied: boolean,
    copyLabel: string,
    copiedLabel: string
) => (copied ? copiedLabel : copyLabel);

export const normalizeLabel = (value: string, fallback: string) => {
    const trimmed = String(value ?? "").trim();
    return trimmed ? trimmed : fallback;
};

const CodeBlockHeader = (props: {
    lang: string;
    copyLabel: () => string;
    copiedLabel: () => string;
    getText: () => string;
}) => {
    const [copied, setCopied] = createSignal(false);
    let resetTimer: number | undefined;
    const copyLabel = () => normalizeLabel(props.copyLabel(), "Copy");
    const copiedLabel = () => normalizeLabel(props.copiedLabel(), "Copied");

    onCleanup(() => {
        if (resetTimer) window.clearTimeout(resetTimer);
    });

    const copy = async () => {
        const text = props.getText();
        if (!text.trim()) return;
        try {
            const ok = await writeClipboardText(text);
            if (!ok) return;
            setCopied(true);
            if (resetTimer) window.clearTimeout(resetTimer);
            resetTimer = window.setTimeout(() => setCopied(false), 1600);
        } catch {
            // ignore copy errors
        }
    };

    return (
        <>
            <span class="inline-flex items-center gap-2 font-mono text-sm">
                <IconCodeBlock class="h-6 w-6 shrink-0 text-[var(--c-text-subtle)]" />
                <span>{props.lang}</span>
            </span>
            <button
                type="button"
                onClick={copy}
                class={`inline-flex items-center gap-2 text-[0.85rem] transition-colors hover:text-[var(--c-text)] ${copied() ? "text-[var(--c-text)]" : "text-[var(--c-text-muted)]"
                    }`}
                title={resolveCopyLabel(copied(), copyLabel(), copiedLabel())}
            >
                <Show
                    when={copied()}
                    fallback={<IconCopy class="h-4 w-4 shrink-0" />}
                >
                    <IconCheck class="h-4 w-4 shrink-0 text-green-600" />
                </Show>
                <span>{resolveCopyLabel(copied(), copyLabel(), copiedLabel())}</span>
            </button>
        </>
    );
};

const mountCodeBlockHeaders = (
    root: HTMLElement,
    labels: { copyLabel: () => string; copiedLabel: () => string }
) => {
    const disposers: Array<() => void> = [];
    const codeBlocks = root.querySelectorAll<HTMLDivElement>(".code-block");
    codeBlocks.forEach((block) => {
        const existingHost = block.querySelector<HTMLDivElement>(":scope > .code-header");
        if (existingHost?.hasChildNodes()) return;
        const headerHost = existingHost ?? document.createElement("div");
        headerHost.className =
            "code-header flex items-center justify-between border-b border-[var(--c-border)] bg-[var(--c-surface-2)] px-4 py-2 text-sm uppercase tracking-[0.06em] text-[var(--c-text-subtle)]";
        if (!existingHost) block.prepend(headerHost);
        const langLabel = normalizeLangLabel(block.getAttribute("data-lang"));
        const getText = () =>
            block.querySelector("pre code")?.textContent ?? "";
        const dispose = render(() => (
            <CodeBlockHeader
                lang={langLabel}
                copyLabel={labels.copyLabel}
                copiedLabel={labels.copiedLabel}
                getText={getText}
            />
        ), headerHost);
        disposers.push(() => {
            dispose();
            if (headerHost.isConnected) headerHost.remove();
        });
    });
    return () => {
        disposers.forEach((dispose) => dispose());
    };
};

export const setupCodeBlocks = (
    root: HTMLElement,
    labels: { copyLabel: () => string; copiedLabel: () => string }
) => {
    const disposeHeaders = mountCodeBlockHeaders(root, labels);
    return () => {
        disposeHeaders();
    };
};
