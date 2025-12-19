import { toCanvas } from "qrcode";
import { For, Match, Switch, createEffect, createSignal } from "solid-js";
import Modal from "../../ui/Modal";

import IconWeChat from "~icons/tabler/brand-wechat";

import { useI18nContext } from "~/i18n/i18n-solid";
import IconEth from "~icons/tabler/currency-ethereum";
import IconSol from "~icons/tabler/currency-solana";

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
            "fig": LL().sidebar.TOOLS.donate.wechat(),
            Icon: IconWeChat
        },
        {
            "key": "eth",
            "val": "0x8108003004784434355758338583453734488488",
            "fig": LL().sidebar.TOOLS.donate.eth(),
            Icon: IconEth
        },
        {
            "key": "sol",
            "val": "PRM3ZUA5N2PRLKVBCL3SR3JS934M9TZKUZ7XTLUS223",
            "fig": LL().sidebar.TOOLS.donate.sol(),
            Icon: IconSol
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
                <div class=":: fixed z-100 top-1/2 left-1/2 -translate-1/2 p-6 bg-surface rounded-lg min-w-full md:min-w-120 ">
                    <p class=":: text-2xl pb-6 font-headline ">{LL().sidebar.TOOLS.donate.title()}</p>
                    <div class=":: flex w-full gap-4 <md:flex-col ">
                        <figure class="mx-auto w-64">
                            <Switch>
                                <Match when={addrIndex()}>
                                    <canvas ref={canvas!} class=":: w-64 h-64 " />
                                </Match>
                                <Match when={!addrIndex()}>
                                    <img src="https://ae01.alicdn.com/kf/HTB1o49SQ9zqK1RjSZPx7634tVXaZ.png" class=":: w-64 h-64 " />
                                </Match>
                            </Switch>
                            <p class=":: w-64 mx-auto text-center text-sm font-headline mt-2 "><span>{addr[addrIndex()].val}</span></p>
                        </figure>
                        <div class=":: flex flex-wrap gap-8 text-lg <md:justify-between md:flex-col md:w-40 ">
                            <For each={addr}>
                                {
                                    (x, idx) => <button onClick={() => setAddrIndex(idx())} class={":: block transition-linear duration-150 flex p-2 items-center rounded-lg gap-4 hover:bg-menu " + (addrIndex() == idx() ? ' text-menu-active' : '')}><x.Icon width={32} height={32} stroke-width={1.5} /> <span>{x.fig}</span></button>
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
