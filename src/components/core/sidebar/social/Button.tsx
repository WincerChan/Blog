import { Show, Suspense, createEffect, createSignal, lazy } from "solid-js";
import { set } from "../../header/ThemeSwitch/Provider";

interface ButtonProps {
    iconName: string;
    hoverColor: string;
    text: string;
    lang?: string;
}

const SocialButton = ({ iconName, hoverColor, text, lang }: ButtonProps) => {
    const [toggle, setToggle] = createSignal(false);
    const Mod = text == "Reward" ? lazy(() => import("./Reward")) : lazy(() => import("./Share"))

    createEffect(() => {
        set("modal", toggle())
    })
    const click = () => {
        setToggle(true)
    }
    return (
        <>
            <button onClick={click} title={text} class={`:: hover:${hoverColor} focus:${hoverColor} trans-linear h-15 lg:w-12 `}>
                <i class={`:: ${iconName} w-9 h-9 `} />
            </button>
            <Show when={toggle()}>
                <Suspense>
                    <Mod toggle={toggle} setToggle={setToggle} lang={lang} />
                </Suspense>
            </Show>
        </>
    )

}

export default SocialButton