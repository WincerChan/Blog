import { toCanvas } from "qrcode";
import { TbBrandTelegram, TbBrandTwitter, TbClipboardCheck, TbClipboardCopy } from "solid-icons/tb";
import { Accessor, Match, Show, Switch, createEffect, createSignal, onMount } from "solid-js";
import { Translations } from "~/i18n/i18n-types";
import Modal from "../../section/Modal";


interface ShareProps {
    toggle: () => boolean;
    setToggle: (toggle: boolean) => void;
    LL: Accessor<Translations>;
}

const Share = ({ toggle, setToggle, LL }: ShareProps) => {
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
            navigator.clipboard.writeText(url)
            setShowCheck(true)
            setTimeout(() => {
                setShowCheck(false)
            }, 2000)
        } else
            window.open(links[idx].url())
    }
    const links = [
        {
            Icon: TbBrandTwitter,
            "url": twitterUrl,
            "text": "Twitter"
        },
        {
            Icon: TbBrandTelegram,
            "url": telegramUrl,
            "text": "Telegram"
        },
        {
            Icon: TbClipboardCopy,
            "text": LL().sidebar.TOOLS.share.copy(),
            "url": null
        }
    ]
    return (
        <>
            <Modal toggle={toggle} setToggle={setToggle}>
                <div class=":: fixed z-100 top-1/2 left-1/2 -translate-1/2 p-6 bg-[var(--ers-bg)] rounded-lg min-w-full md:min-w-120">
                    <p class=":: text-2xl pb-6 font-headline ">{LL().sidebar.TOOLS.share.title()}</p>
                    <div class=":: flex w-full gap-4 <md:flex-col ">
                        <figure class="w-64 mx-auto">
                            <canvas ref={canvas!} class=":: w-64 h-64 " />
                            <figcaption class=":: text-center text-sm font-headline mt-2 ">{LL().sidebar.TOOLS.share.scan()}</figcaption>
                        </figure>
                        <div class=":: flex flex-wrap gap-8 text-lg <md:justify-between md:flex-col md:w-40 ">
                            {
                                links.slice(0, 2).map((value, idx) => (
                                    <>
                                        <button onClick={() => clickJump(idx)} class=":: trans-linear duration-150 flex p-2 items-center rounded-lg gap-4 bg-menuHover ">
                                            <value.Icon class=":: w-8 h-8 " stroke-width={1.5} />
                                            <span innerText={value.text}></span>
                                        </button>
                                        <Show when={showCheck() && value.url == null}>
                                            <p class=":: flex items-center gap-2 text-emerald-500 mx-auto animate-fade-in animate-duration-200 ">
                                                <TbClipboardCheck class=":: w-6 h-6 " stroke-width={1.5} />
                                                <span>{LL().sidebar.TOOLS.share.copy_msg()}</span>
                                            </p>
                                        </Show>
                                    </>
                                ))
                            }
                            <button onClick={() => clickJump(2)} class=":: trans-linear duration-150 flex p-2 items-center rounded-lg gap-4 bg-menuHover ">
                                <Switch>
                                    <Match when={showCheck()}>
                                        <p class=":: flex items-center gap-4 text-emerald-500 animate-fade-in animate-duration-200">
                                            <TbClipboardCheck class=":: w-8 h-8 " stroke-width={1.5} />
                                            <span>{LL().sidebar.TOOLS.share.copy_msg()}</span>
                                        </p>
                                    </Match>
                                    <Match when={!showCheck()}>
                                        <TbClipboardCopy class=":: w-8 h-8 " stroke-width={1.5} />
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