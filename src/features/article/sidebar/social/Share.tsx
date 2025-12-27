import { toCanvas } from "qrcode";
import { Match, Switch, createEffect, createSignal, onMount } from "solid-js";
import { useI18nContext } from "~/i18n/i18n-solid";
import IconTelegram from "~icons/tabler/brand-telegram";
import IconTwitter from "~icons/tabler/brand-twitter";
import IconClipboardCheck from "~icons/tabler/clipboard-check";
import IconClipboard from "~icons/tabler/clipboard-copy";
import Modal from "~/features/article/components/Modal";


interface ShareProps {
    toggle: () => boolean;
    setToggle: (toggle: boolean) => void;
}

const Share = ({ toggle, setToggle }: ShareProps) => {
    const { LL } = useI18nContext()

    const [twitterUrl, setTwitterUrl] = createSignal("")
    const [telegramUrl, setTelegramUrl] = createSignal("")
    const [showCheck, setShowCheck] = createSignal(false)

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
        if (idx == 2) {
            const url = window.location.href
            void navigator.clipboard.writeText(url).catch(() => undefined)
            setShowCheck(true)
            setTimeout(() => {
                setShowCheck(false)
            }, 2000)
        } else
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
        },
        {
            Icon: IconClipboard,
            "text": LL().sidebar.TOOLS.share.copy(),
            "url": null
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
                                links.slice(0, 2).map((value, idx) => (
                                    <button onClick={() => clickJump(idx)} class="">
                                        <value.Icon width={32} height={32} stroke-width={1.5} />
                                        <span innerText={value.text}></span>
                                    </button>
                                ))
                            }
                            <button onClick={() => clickJump(2)} class="">
                                <Switch>
                                    <Match when={showCheck()}>
                                        <p class="">
                                            <IconClipboardCheck width={32} height={32} />
                                            <span>{LL().sidebar.TOOLS.share.copy_msg()}</span>
                                        </p>
                                    </Match>
                                    <Match when={!showCheck()}>
                                        <IconClipboard width={32} height={32} />
                                        <span innerText={links[2].text}></span>
                                    </Match>
                                </Switch>
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    )
}

export default Share
