import { toCanvas } from "qrcode";
import { For, Match, Switch, createEffect, createSignal } from "solid-js";
import Modal from "~/features/article/components/Modal";

import { useI18nContext } from "~/i18n/i18n-solid";

interface RewardProps {
    toggle: () => boolean;
    setToggle: (toggle: boolean) => void;
}

const Reward = ({ toggle, setToggle }: RewardProps) => {
    const { LL } = useI18nContext()

    const addr = [
        {
            "key": "wechat",
            "val": "",
            "fig": LL().sidebar.TOOLS.donate.wechat()
        },
        {
            "key": "eth",
            "val": "0x8108003004784434355758338583453734488488",
            "fig": LL().sidebar.TOOLS.donate.eth()
        },
        {
            "key": "sol",
            "val": "PRM3ZUA5N2PRLKVBCL3SR3JS934M9TZKUZ7XTLUS223",
            "fig": LL().sidebar.TOOLS.donate.sol()
        }
    ]
    const [addrIndex, setAddrIndex] = createSignal(0);
    let canvas: HTMLCanvasElement | null = null;
    createEffect(() => {
        if (addrIndex()) {
            toCanvas(canvas, addr[addrIndex()].val, { width: 256, margin: 0 }, (err) => {
                if (err) console.error(err)
            })
        }
    }, [addrIndex])
    return (
        <>
            <Modal toggle={toggle} setToggle={setToggle}>
                <div class="">
                    <p class="">{LL().sidebar.TOOLS.donate.title()}</p>
                    <div class="">
                        <figure class="">
                            <Switch>
                                <Match when={addrIndex()}>
                                    <canvas ref={canvas!} class="" />
                                </Match>
                                <Match when={!addrIndex()}>
                                    <img src="https://ae01.alicdn.com/kf/HTB1o49SQ9zqK1RjSZPx7634tVXaZ.png" class="" />
                                </Match>
                            </Switch>
                            <p class=""><span>{addr[addrIndex()].val}</span></p>
                        </figure>
                        <div class="">
                            <For each={addr}>
                                {
                                    (x, idx) => (
                                        <button onClick={() => setAddrIndex(idx())} class="">
                                            <span>{x.fig}</span>
                                        </button>
                                    )
                                }
                            </For>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    )
}

export default Reward;
