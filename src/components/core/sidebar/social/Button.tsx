import { IconTypes } from "solid-icons";
import { Accessor, Show, Suspense, createEffect, createSignal, lazy } from "solid-js";
import { Translations } from "~/i18n/i18n-types";
import { set } from "../../header/ThemeSwitch/Provider";

interface ButtonProps {
    IconName: IconTypes;
    hoverColor: string;
    text: string;
    LL?: Accessor<Translations>;
}

const SocialButton = ({ IconName, hoverColor, text, LL }: ButtonProps) => {
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
                <IconName width={36} height={36} class=":: mx-auto " stroke-width={1.5} />
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