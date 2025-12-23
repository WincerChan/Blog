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
                <form onSubmit={handleDecrypt} class=":: flex space-x-4 my-6 ">
                    <input type="text" class=":: outline-card bg-[var(--blockquote-border)] px-4 py-1.5 rounded flex-grow " placeholder="你面前的是一个未知的领域，输入密码才能继续前进。" />
                    <button title="解密" class=":: font-headline px-4 outline-card rounded " disabled={loading()}>
                        {loading() ? "解密中" : "解密"}
                    </button>
                </form>
            </Show>
            <Show when={error()}><b class="">{error()}</b></Show>
            <Show when={show()}><section class="md-content" innerHTML={content()} /></Show>
        </>
    )
}

export default ProtectBlog
