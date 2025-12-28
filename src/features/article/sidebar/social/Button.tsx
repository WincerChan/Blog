import { IconTypes } from "solid-icons";
import { createEffect, createSignal, lazy, Match, Show, Suspense, Switch } from "solid-js";

interface ButtonProps {
    IconName: IconTypes;
    hoverColor: string;
    text: string;
    kind: "reward" | "share";
}

const Reward = lazy(() => import("./Reward"))
const Share = lazy(() => import("./Share"))


const SocialButton = ({ IconName, hoverColor, text, kind }: ButtonProps) => {
    const [toggle, setToggle] = createSignal(false);

    createEffect(() => {
        if (toggle())
            document.body.style.overflow = 'hidden'
        else
            document.body.style.overflow = ''
    })

    const click = () => {
        setToggle(true)
    }
    return (
        <>
            <button
                onClick={click}
                title={text}
                class={`inline-flex items-center justify-center text-[var(--c-text-muted)] transition-colors hover:text-[var(--c-text)] ${hoverColor}`}
            >
                <IconName width={36} height={36} class="block" />
            </button>
            <Show when={toggle()}>
                <Suspense>
                    <Switch>
                        <Match when={kind === "reward"}>
                            <Reward toggle={toggle} setToggle={setToggle} />
                        </Match>
                        <Match when={kind === "share"}>
                            <Share toggle={toggle} setToggle={setToggle} />
                        </Match>
                    </Switch>
                </Suspense>
            </Show>
        </>
    )

}

export default SocialButton
