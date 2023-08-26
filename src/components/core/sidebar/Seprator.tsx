import { JSXElement } from "solid-js";

const Seprator = ({ children }: { children: JSXElement }) => {
    return (
        <>
            <h3 class=":: font-headline text-[var(--subtitle)] ">{children}</h3>
        </>
    )
}

export default Seprator;