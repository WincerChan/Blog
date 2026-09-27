import { Show, createEffect, createSignal, onCleanup } from "solid-js";
import { useI18nContext } from "~/i18n/i18n-solid";
import { setupCodeBlocks } from "~/features/article/components/CodeBlockHeader";
import IconKey from "~icons/ph/key";
import IconLock from "~icons/ph/lock-simple";

const ENCRYPTION_VERSION = "v1";
const PBKDF2_ITERATIONS = 120000;
const KEY_BYTES = 32;

const base64ToBytes = (value: string) => Uint8Array.from(atob(value), (c) => c.charCodeAt(0));

const concatBytes = (a: Uint8Array, b: Uint8Array) => {
    const out = new Uint8Array(a.length + b.length);
    out.set(a, 0);
    out.set(b, a.length);
    return out;
};

const decryptHtml = async (payload: string, password: string) => {
    const parts = String(payload ?? "").split(":");
    if (parts.length !== 5 || parts[0] !== ENCRYPTION_VERSION) {
        throw new Error("Invalid payload");
    }
    const [, saltB64, ivB64, tagB64, dataB64] = parts;
    const salt = base64ToBytes(saltB64);
    const iv = base64ToBytes(ivB64);
    const tag = base64ToBytes(tagB64);
    const data = base64ToBytes(dataB64);
    const combined = concatBytes(data, tag);

    if (!globalThis.crypto?.subtle) {
        throw new Error("WebCrypto unavailable");
    }
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        "PBKDF2",
        false,
        ["deriveKey"],
    );
    const key = await crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt,
            iterations: PBKDF2_ITERATIONS,
            hash: "SHA-256",
        },
        keyMaterial,
        { name: "AES-GCM", length: KEY_BYTES * 8 },
        false,
        ["decrypt"],
    );
    const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv, tagLength: 128 },
        key,
        combined,
    );
    return new TextDecoder().decode(decrypted);
};

const ProtectBlog = ({ source }: { source: string }) => {
    const { LL } = useI18nContext()
    const [show, setShow] = createSignal(false)
    const [content, setContent] = createSignal(source)
    const [error, setError] = createSignal<string | null>(null)
    const [loading, setLoading] = createSignal(false)
    let input: HTMLInputElement | undefined
    let article: HTMLDivElement | undefined

    createEffect(() => {
        if (!show() || !article) return
        const dispose = setupCodeBlocks(article, {
            copyLabel: () => LL().sidebar.CODE.copy(),
            copiedLabel: () => LL().sidebar.CODE.copied(),
        })
        onCleanup(dispose)
    })

    const handleDecrypt = async (e: SubmitEvent) => {
        e.preventDefault()
        if (loading()) return
        const password = input?.value.trim() ?? ""
        if (!password) {
            setError("请输入密码。")
            input?.focus()
            return
        }
        setLoading(true)
        try {
            const decrypted = await decryptHtml(content(), password)
            setContent(decrypted)
            setShow(true)
            setError(null)
        } catch {
            setError("密码错误或解密失败。")
            input?.select()
        } finally {
            setLoading(false)
        }
    }
    return (
        <Show
            when={show()}
            fallback={
                <form
                    onSubmit={handleDecrypt}
                    class="my-10 max-w-[42rem] rounded-lg border border-[var(--c-border)] bg-[var(--c-surface-2)] px-5 py-6 md:px-8 md:py-8"
                >
                    <div class="flex items-center gap-2 text-[var(--c-text)]">
                        <IconLock class="h-5 w-5 text-[var(--c-link)]" />
                        <h2 class="text-base md:text-lg font-semibold">这篇文章已加密</h2>
                    </div>
                    <p class="mt-2 text-sm leading-relaxed text-[var(--c-text-subtle)]">
                        你面前的是一个未知的领域，输入密码才能继续前进。
                    </p>
                    <div class="mt-6 flex items-stretch gap-3">
                        <input
                            ref={input}
                            type="password"
                            autocomplete="off"
                            aria-label="文章密码"
                            aria-invalid={!!error()}
                            aria-describedby="encrypt-error"
                            onInput={() => error() && setError(null)}
                            class="min-w-0 flex-1 rounded-md border border-[var(--c-border)] bg-[var(--c-surface)] px-3 py-2 font-mono text-sm text-[var(--c-text)] caret-[var(--c-text)] outline-none transition-colors placeholder:text-[var(--c-text-subtle)] hover:border-[var(--c-border-strong)] focus:border-[var(--c-focus)] focus:ring-2 focus:ring-[var(--c-accent-weak)]"
                            classList={{ "!border-red-500/70": !!error() }}
                            placeholder="输入密码"
                        />
                        <button
                            type="submit"
                            title="解密"
                            disabled={loading()}
                            class="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-[var(--c-border-strong)] bg-[var(--c-surface)] px-4 py-2 text-sm text-[var(--c-text)] transition-colors hover:border-[var(--c-link)] hover:text-[var(--c-link)] disabled:cursor-wait disabled:opacity-60"
                        >
                            <IconKey class="h-4 w-4" classList={{ "animate-pulse": loading() }} />
                            {loading() ? "解密中" : "解密"}
                        </button>
                    </div>
                    <p
                        id="encrypt-error"
                        role="alert"
                        class="mt-3 min-h-5 text-sm text-red-600 dark:text-red-400"
                    >
                        {error()}
                    </p>
                </form>
            }
        >
            <div
                ref={article}
                id="blog-article"
                class="prose dark:prose-invert md:text-[1.05rem] max-w-[42rem]"
                innerHTML={content()}
            />
        </Show>
    )
}

export default ProtectBlog
