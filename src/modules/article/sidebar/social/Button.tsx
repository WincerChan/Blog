import { IconTypes } from "solid-icons";
import { Accessor, createEffect, createSignal, lazy, Match, Show, Suspense, Switch } from "solid-js";
import { Translations } from "~/i18n/i18n-types";

interface ButtonProps {
    IconName: IconTypes;
    hoverColor: string;
    text: string;
    LL?: Accessor<Translations>;
    lang: string
}

const Reward = lazy(() => import("./Reward"))
const Share = lazy(() => import("./Share"))


const SocialButton = ({ IconName, hoverColor, text, LL, lang }: ButtonProps) => {
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
            <button onClick={click} title={text} class={`:: ${hoverColor} transition-linear h-15 w-24 `}>
                <IconName width={36} height={36} class=":: mx-auto " stroke-width={1.5} />
            </button>
            <Show when={toggle()}>
                <Suspense>
                    <Switch>
                        <Match when={text === "Reward"}>
                            <Reward toggle={toggle} setToggle={setToggle} lang={lang} />
                        </Match>
                        <Match when={text === "Share"}>
                            <Share toggle={toggle} setToggle={setToggle} lang={lang} />
                        </Match>
                    </Switch>
                </Suspense>
            </Show>
        </>
    )

}

export default SocialButton
