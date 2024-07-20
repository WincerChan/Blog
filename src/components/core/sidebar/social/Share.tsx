import { toCanvas } from "qrcode";
import { Accessor, Match, Switch, createEffect, createSignal, onMount } from "solid-js";
import { Translations } from "~/i18n/i18n-types";
import IconTwitter from "~icons/tabler/brand-twitter";
import IconClipboardCheck from "~icons/tabler/clipboard-check";
import IconClipboard from "~icons/tabler/clipboard-copy";
import Modal from "../../section/Modal";


interface ShareProps {
    toggle: () => boolean;
    setToggle: (toggle: boolean) => void;
    LL: Accessor<Translations>;
}

const Share = ({ toggle, setToggle, LL }: ShareProps) => {
    const [twitterUrl, setTwitterUrl] = createSignal("")
    const [showCheck, setShowCheck] = createSignal(false)

    let canvas: HTMLCanvasElement | null = null;
    onMount(() => {
        const url = window.location.href, title = "Hey, I just found this fascinating article that's worth a read!"
        setTwitterUrl(`https://twitter.com/intent/tweet?text=${encodeURI(title)}&url=${url}`)
    })
    createEffect(() => {
        if (toggle()) {
            toCanvas(canvas, window.location.href, { width: 256, margin: 0 }, (err) => {
                if (err) console.error(err)
            })
        }
    })

    const clickJump = (idx) => {
        if (idx == 1) {
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
            Icon: IconTwitter,
            "url": twitterUrl,
            "text": "Twitter"
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
                <div class=":: fixed z-100 top-1/2 left-1/2 -translate-1/2 p-6 bg-[var(--ers-bg)] rounded-lg min-w-full md:min-w-120">
                    <p class=":: text-2xl pb-6 font-headline ">{LL().sidebar.TOOLS.share.title()}</p>
                    <div class=":: flex w-full gap-4 <md:flex-col ">
                        <figure class="w-64 mx-auto">
                            <canvas ref={canvas!} class=":: w-64 h-64 " />
                            <figcaption class=":: text-center text-sm font-headline mt-2 ">{LL().sidebar.TOOLS.share.scan()}</figcaption>
                        </figure>
                        <div class=":: flex flex-wrap gap-8 text-lg <md:justify-between md:flex-col md:w-40 ">
                            {
                                links.slice(0, 1).map((value, idx) => (
                                    <button onClick={() => clickJump(idx)} class=":: transition-linear duration-150 flex p-2 items-center rounded-lg gap-4 hover:bg-menu ">
                                        <value.Icon width={32} height={32} stroke-width={1.5} />
                                        <span innerText={value.text}></span>
                                    </button>
                                ))
                            }
                            <button onClick={() => clickJump(2)} class=":: transition-linear duration-150 flex p-2 items-center rounded-lg gap-4 hover:bg-menu ">
                                <Switch>
                                    <Match when={showCheck()}>
                                        <p class=":: flex items-center gap-4 text-emerald-500 animate-fade-in animate-duration-200">
                                            <IconClipboardCheck width={32} height={32} />
                                            <span>{LL().sidebar.TOOLS.share.copy_msg()}</span>
                                        </p>
                                    </Match>
                                    <Match when={!showCheck()}>
                                        <IconClipboard width={32} height={32} />
                                        <span innerText={links[1].text}></span>
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