import { A } from "solid-start";
import Seprator from "./Seprator";

const Archives = () => {
    return (
        <div class="w-full">
            <Seprator title="归档" />
            <div class=":: mb-6 w-24 text-[var(--extra)] ">
                {Object.entries(__POSTS_BY_YEAR).reverse().slice(0, 5).map(val => (
                    <A class=":: text-menuHover " inactiveClass="" activeClass="" href={`/archives/?year=${val[0]}`}>
                        <p>{val[0]}（{val[1]}）</p>
                    </A>
                ))}
            </div>
        </div >
    )
}

export default Archives;