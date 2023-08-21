import { createSignal } from "solid-js";

interface ButtonProps {
    iconName: string;
}

const Button = ({ iconName }: ButtonProps) => {
    const [toggle, setToggle] = createSignal(false);
    return (
        <button onClick={() => setToggle(true)} title="Reward" class="hover:text-amber-500 focus:text-amber-500 trans-linear h-15 md:w-12">
            <i class={`${iconName} w-9 h-9`} />
        </button>
    )

}