import { Show, createEffect, createSignal } from "solid-js"
import { set } from "../header/ThemeSwitch/Provider"

const Donate = () => {
    const [showWx, setShowWx] = createSignal(false)
    createEffect(() => {
        set({ modal: showWx() })
    })
    return (
        <div class="w-full pl-3 my-8 border-l-6 text-[var(--donate-text)] border-[var(--donate-border)] py-3 pr-4 text-lg">
            <p class="mx-auto">喜欢这篇文章？可以通过
                <span onClick={() => setShowWx(true)} title="微信" class="text-#1AAD19 cursor-pointer relative mx-1 underline underline-offset-3 decoration">微信赞赏码
                </span>
                或者
                <a title="Buy Me a Coffee" class="text-#fd0 mx-1 underline underline-offset-3" href="https://www.buymeacoffee.com/wincer" target="_blank">
                    Buy Me a Coffee
                </a>
                打赏支持一下作者。</p>
            <Show when={showWx()}>
                <div onClick={() => setShowWx(false)} class="fixed w-screen top-0 h-screen left-0 bg-[var(--meta-bg)] z-20">
                    <img class="fixed z-100 top-1/2 left-1/2 -translate-1/2 w-72 h-72" src="https://ae01.alicdn.com/kf/HTB1o49SQ9zqK1RjSZPx7634tVXaZ.png" alt="赞赏" />
                </div>
            </Show>
        </div >
    )
}

export default Donate