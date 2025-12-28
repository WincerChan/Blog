import { toCanvas } from "qrcode";
import { createEffect, createSignal, onMount } from "solid-js";
import { useI18nContext } from "~/i18n/i18n-solid";
import IconTelegram from "~icons/ph/telegram-logo";
import IconTwitter from "~icons/ph/twitter-logo";
import Modal from "~/features/article/components/Modal";


interface ShareProps {
    toggle: () => boolean;
    setToggle: (toggle: boolean) => void;
}

const Share = ({ toggle, setToggle }: ShareProps) => {
    const { LL } = useI18nContext()

    const [twitterUrl, setTwitterUrl] = createSignal("")
    const [telegramUrl, setTelegramUrl] = createSignal("")
    let canvas: HTMLCanvasElement | null = null;
    onMount(() => {
        const url = window.location.href, title = "Hey, I just found this fascinating article that's worth a read!"
        setTwitterUrl(`https://twitter.com/intent/tweet?text=${encodeURI(title)}&url=${url}`)
        setTelegramUrl(`https://telegram.me/share/url?url=${url}&text=${encodeURI(title)}`)
    })
    createEffect(() => {
        if (toggle()) {
            toCanvas(canvas, window.location.href, { width: 256, margin: 0 }, (err) => {
                if (err) console.error(err)
            })
        }
    })

    const clickJump = (idx) => {
        window.open(links[idx].url())
    }
    const links = [
        {
            Icon: IconTwitter,
            "url": twitterUrl,
            "text": "Twitter"
        },
        {
            Icon: IconTelegram,
            "url": telegramUrl,
            "text": "Telegram"
        }
    ]
    return (
        <>
            <Modal toggle={toggle} setToggle={setToggle}>
                <div class="">
                    <p class="">{LL().sidebar.TOOLS.share.title()}</p>
                    <div class="">
                        <figure class="">
                            <canvas ref={canvas!} class="" />
                            <figcaption class="">{LL().sidebar.TOOLS.share.scan()}</figcaption>
                        </figure>
                        <div class="">
                            {
                                links.map((value, idx) => (
                                    <button onClick={() => clickJump(idx)} class="">
                                        <value.Icon width={32} height={32} />
                                        <span innerText={value.text}></span>
                                    </button>
                                ))
                            }
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    )
}

export default Share
