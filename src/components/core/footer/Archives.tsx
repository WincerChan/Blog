import { A } from "solid-start";
import { useI18nContext } from "~/i18n/i18n-solid";

const Archives = () => {
    const { LL } = useI18nContext()
    return (
        <div class="">
            <label class=":: font-headline text-[var(--subtitle)]">{LL().footer.A()}</label>
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