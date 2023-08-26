import { Accessor, Show, Suspense, createEffect, createSignal, lazy } from "solid-js";
import { set } from "../../header/ThemeSwitch/Provider";
import { Translations } from "~/i18n/i18n-types";

interface ButtonProps {
    iconName: string;
    hoverColor: string;
    text: string;
    LL?: Accessor<Translations>;
}

const SocialButton = ({ iconName, hoverColor, text, LL }: ButtonProps) => {
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
            <button onClick={click} title={text} class={`:: ${hoverColor} trans-linear h-15 w-24 `}>
                <i class={`:: ${iconName} w-9 h-9 `} />
            </button>
            <Show when={toggle()}>
                <Suspense>
                    <Mod toggle={toggle} setToggle={setToggle} LL={LL} />
                </Suspense>
            </Show>
        </>
    )

}

export default SocialButton