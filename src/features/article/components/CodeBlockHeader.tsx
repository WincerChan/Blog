import { render } from "solid-js/web";
import IconCopy from "~icons/ph/copy";

const normalizeLangLabel = (value: string | null) => {
    const trimmed = String(value ?? "").trim();
    return trimmed ? trimmed.toLowerCase() : "text";
};

const CODE_HEADER_CLASS =
    "code-header flex items-center justify-between border-b border-[var(--c-border)] bg-[var(--c-surface-2)] px-4 py-2 text-sm uppercase tracking-[0.06em] text-[var(--c-text-subtle)]";
const CODE_LANG_CLASS = "code-lang inline-flex items-center gap-2 font-mono text-sm";
const CODE_COPY_BASE_CLASS =
    "code-copy inline-flex items-center gap-2 text-sm text-[var(--c-text-muted)] transition-colors hover:text-[var(--c-text)]";
const CODE_COPY_ACTIVE_CLASS = "text-[var(--c-text)]";
const CODE_COPY_MUTED_CLASS = "text-[var(--c-text-muted)]";
const CODE_COPY_ICON_CLASS = "code-copy-icon h-4 w-4 shrink-0";

const CodeBlockHeader = (props: { lang: string }) => (
    <>
        <span class={CODE_LANG_CLASS}>
            <span class="code-lang-text">{props.lang}</span>
        </span>
        <button
            type="button"
            class={CODE_COPY_BASE_CLASS}
            data-code-copy="true"
            data-copy-label="Copy"
            data-copied-label="Copied"
            title="Copy"
        >
            <IconCopy class={CODE_COPY_ICON_CLASS} />
            <span class="code-copy-text">Copy</span>
        </button>
    </>
);

const mountCodeBlockHeaders = (root: HTMLElement) => {
    const disposers: Array<() => void> = [];
    const codeBlocks = root.querySelectorAll<HTMLDivElement>(".code-block");
    codeBlocks.forEach((block) => {
        if (block.querySelector(":scope > .code-header")) return;
        const headerHost = document.createElement("div");
        headerHost.className = CODE_HEADER_CLASS;
        block.prepend(headerHost);
        const langLabel = normalizeLangLabel(block.getAttribute("data-lang"));
        const dispose = render(() => <CodeBlockHeader lang={langLabel} />, headerHost);
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
            button.classList.add(CODE_COPY_ACTIVE_CLASS);
            button.classList.remove(CODE_COPY_MUTED_CLASS);
            if (textNode) textNode.textContent = copiedLabel;
            else button.textContent = copiedLabel;
            window.setTimeout(() => {
                if (!button.isConnected) return;
                button.removeAttribute("data-copied");
                button.classList.remove(CODE_COPY_ACTIVE_CLASS);
                button.classList.add(CODE_COPY_MUTED_CLASS);
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

export const setupCodeBlocks = (root: HTMLElement) => {
    const disposeHeaders = mountCodeBlockHeaders(root);
    const disposeCopy = attachCodeCopyHandler(root);
    return () => {
        disposeCopy();
        disposeHeaders();
    };
};
