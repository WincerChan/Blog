import { A } from "solid-start"

const Donate = () => {
    return (
        <div class="w-full pl-3 my-8 border-l-6 text-[var(--donate-text)] border-[var(--donate-border)] py-3 pr-4 text-lg">
            <p class="mx-auto">喜欢这篇文章吗？可以通过
                <A title="爱发电" class="text-#946ce6 mx-1 underline underline-offset-3 decoration" inactiveClass="" activeClass="" href="https://afdian.net/@wincer" target="_blank">
                    爱发电
                </A>
                或者
                <A title="Buy Me a Coffee" class="text-#fd0 mx-1 underline underline-offset-3" inactiveClass="" activeClass="" href="https://www.buymeacoffee.com/wincer" target="_blank">
                    Buy Me a Coffee
                </A>
                打赏支持一下作者。</p>
        </div >
    )
}

export default Donate