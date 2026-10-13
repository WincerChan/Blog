import { Show, createSignal } from "solid-js";

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

const ProtectBlog = ({ source }) => {
    const [show, setShow] = createSignal(false)
    const [content, setContent] = createSignal(source)
    const [error, setError] = createSignal<string | null>(null)
    const [loading, setLoading] = createSignal(false)

    const handleDecrypt = async (e) => {
        e.preventDefault()
        const input = (e.currentTarget[0] as HTMLInputElement).value.trim()
        if (!input) {
            setError("请输入密码。")
            return
        }
        setLoading(true)
        try {
            const decrypted = await decryptHtml(content(), input)
            setContent(decrypted)
            setShow(true)
            setError(null)
        } catch (error) {
            setError("密码错误或解密失败。")
        } finally {
            setLoading(false)
        }
    }
    return (
        <>
            <Show when={!show()}>
                <form onSubmit={handleDecrypt} class="my-6 flex flex-col gap-3 sm:flex-row">
                    <input
                        type="password"
                        aria-label="文章密码"
                        aria-invalid={!!error()}
                        aria-describedby={error() ? "decrypt-error" : undefined}
                        autocomplete="current-password"
                        class="min-w-0 w-full flex-1 rounded-md border border-[var(--c-border-strong)] bg-[var(--c-surface-2)] px-4 py-3 text-base text-[var(--c-text)] placeholder:text-[var(--c-text-subtle)] focus:border-[var(--c-link)]"
                        placeholder="你面前的是一个未知的领域，输入密码才能继续前进。"
                    />
                    <button
                        type="submit"
                        title="解密"
                        class="min-h-11 shrink-0 rounded-md border border-[var(--c-border-strong)] px-5 py-2.5 text-base font-medium text-[var(--c-text)] transition-colors hover:border-[var(--c-link)] hover:bg-[var(--c-hover-bg)] disabled:cursor-wait disabled:opacity-60"
                        disabled={loading()}
                    >
                        {loading() ? "解密中" : "解密"}
                    </button>
                </form>
            </Show>
            <Show when={error()}>
                <p id="decrypt-error" role="alert" class="my-3 text-sm text-red-600 dark:text-red-400">{error()}</p>
            </Show>
            <Show when={show()}><section class="" innerHTML={content()} /></Show>
        </>
    )
}

export default ProtectBlog
