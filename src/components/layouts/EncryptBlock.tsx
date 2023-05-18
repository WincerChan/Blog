import { AES, enc } from "crypto-js";
import { Show, createSignal } from "solid-js";
import { padTo32 } from "~/utils";

const ProtectBlog = ({ source }) => {
    const [show, setShow] = createSignal(false)
    const [content, setContent] = createSignal(source)
    const [error, setError] = createSignal(false)

    const handleDecrypt = (e) => {
        e.preventDefault()
        const input = (e.currentTarget[0] as HTMLInputElement).value
        const key = enc.Hex.parse(padTo32(input))
        try {
            const decrypted = AES.decrypt(content(), key, { iv: key })
            setContent(decrypted.toString(enc.Utf8))
            setShow(true)
            setError(false)
        } catch (error) {
            setError(true)
        }
    }
    return (
        <>
            <Show when={!show()}>
                <form onSubmit={handleDecrypt} class=":: flex space-x-4 my-6 <md:mx-4 ">
                    <input type="text" class=":: card-outline bg-[var(--cc)] px-4 py-1.5 rounded flex-grow " placeholder="你面前的是一个未知的领域，输入密码才能继续前进。" />
                    <button title="解密" class=":: font-headline px-4 card-outline rounded ">解密</button>
                </form>
            </Show>
            <Show when={error()}><b class="<md:mx-4">密码错误，这个未知的领域离你还很遥远。</b></Show>
            <Show when={show()}><section innerHTML={content()} /></Show>
        </>
    )
}

export default ProtectBlog