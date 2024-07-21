import { JSXElement } from "solid-js";

const Seprator = ({ children }: { children: JSXElement }) => {
    return (
        <>
            <h3 class=":: text-[15px]  font-headline text-[var(--subtitle)] ">{children}</h3>
        </>
    )
}

export default Seprator;