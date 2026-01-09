import { render } from "solid-js/web";
import IconCopy from "~icons/ph/copy";
import IconCheck from "~icons/ph/check";

const normalizeLangLabel = (value: string | null) => {
    const trimmed = String(value ?? "").trim();
    return trimmed ? trimmed.toLowerCase() : "text";
};

const CodeBlockHeader = (props: { lang: string; copyLabel: string; copiedLabel: string }) => (
    <>
        <span class="inline-flex items-center gap-2 font-mono text-sm">
            <span class="code-lang-text">{props.lang}</span>
        </span>
        <button
            type="button"
            class="inline-flex items-center gap-2 text-sm text-[var(--c-text-muted)] transition-colors hover:text-[var(--c-text)]"
            data-code-copy="true"
            data-copy-label={props.copyLabel}
            data-copied-label={props.copiedLabel}
            title={props.copyLabel}
        >
            <IconCopy class="h-4 w-4 shrink-0" data-role="copy-icon" />
            <IconCheck class="h-4 w-4 shrink-0 hidden text-green-600" data-role="check-icon" />
            <span class="code-copy-text">{props.copyLabel}</span>
        </button>
    </>
);

const mountCodeBlockHeaders = (
    root: HTMLElement,
    labels: { copyLabel: string; copiedLabel: string }
) => {
    const disposers: Array<() => void> = [];
    const codeBlocks = root.querySelectorAll<HTMLDivElement>(".code-block");
    codeBlocks.forEach((block) => {
        if (block.querySelector(":scope > .code-header")) return;
        const headerHost = document.createElement("div");
        headerHost.className =
            "code-header flex items-center justify-between border-b border-[var(--c-border)] bg-[var(--c-surface-2)] px-4 py-2 text-sm uppercase tracking-[0.06em] text-[var(--c-text-subtle)]";
        block.prepend(headerHost);
        const langLabel = normalizeLangLabel(block.getAttribute("data-lang"));
        const dispose = render(
            () => (
                <CodeBlockHeader
                    lang={langLabel}
                    copyLabel={labels.copyLabel}
                    copiedLabel={labels.copiedLabel}
                />
            ),
            headerHost
        );
        disposers.push(() => {
            dispose();
            if (headerHost.isConnected) headerHost.remove();
        });
    });
    return () => {
        disposers.forEach((dispose) => dispose());
    };
};

const attachCodeCopyHandler = (root: HTMLElement) => {
    const handleClick = async (event: MouseEvent) => {
        const target = event.target as HTMLElement | null;
        if (!target) return;
        const button = target.closest<HTMLButtonElement>("button[data-code-copy]");
        if (!button) return;
        const pre = button.closest(".code-block")?.querySelector("pre");
        const code = pre?.querySelector("code");
        const text = code?.textContent ?? "";
        if (!text.trim()) return;

        const label = button.getAttribute("data-copy-label") ?? "Copy";
        const copiedLabel = button.getAttribute("data-copied-label") ?? "Copied";
        const textNode = button.querySelector<HTMLElement>(".code-copy-text");
        const copyIcon = button.querySelector<HTMLElement>("[data-role='copy-icon']");
        const checkIcon = button.querySelector<HTMLElement>("[data-role='check-icon']");

        const writeText = async () => {
            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(text);
                return true;
            }
            const textarea = document.createElement("textarea");
            textarea.value = text;
            textarea.style.position = "fixed";
            textarea.style.opacity = "0";
            document.body.appendChild(textarea);
            textarea.select();
            const ok = document.execCommand("copy");
            textarea.remove();
            return ok;
        };

        try {
            const ok = await writeText();
            if (!ok) return;
            button.setAttribute("data-copied", "true");
            button.classList.add("text-[var(--c-text)]");
            button.classList.remove("text-[var(--c-text-muted)]");
            copyIcon?.classList.add("hidden");
            checkIcon?.classList.remove("hidden");
            if (textNode) textNode.textContent = copiedLabel;
            else button.textContent = copiedLabel;
            window.setTimeout(() => {
                if (!button.isConnected) return;
                button.removeAttribute("data-copied");
                button.classList.remove("text-[var(--c-text)]");
                button.classList.add("text-[var(--c-text-muted)]");
                copyIcon?.classList.remove("hidden");
                checkIcon?.classList.add("hidden");
                if (textNode) textNode.textContent = label;
                else button.textContent = label;
            }, 1600);
        } catch {
            // ignore copy errors
        }
    };
    root.addEventListener("click", handleClick);
    return () => root.removeEventListener("click", handleClick);
};

export const setupCodeBlocks = (
    root: HTMLElement,
    labels: { copyLabel: string; copiedLabel: string }
) => {
    const disposeHeaders = mountCodeBlockHeaders(root, labels);
    const disposeCopy = attachCodeCopyHandler(root);
    return () => {
        disposeCopy();
        disposeHeaders();
    };
};
