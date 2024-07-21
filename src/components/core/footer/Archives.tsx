import { useI18nContext } from "~/i18n/i18n-solid";

const Archives = () => {
    const { LL } = useI18nContext()
    return (
        <div class="">
            <label class=":: text-[15px]  font-headline text-[var(--subtitle)]">{LL && LL().footer.A()}</label>
            <div class=":: mb-6 w-24 text-[var(--extra)] md:grid grid-rows-4 grid-flow-col gap-x-4 ">
                {Object.entries(__POSTS_BY_YEAR).reverse().map(val => (
                    <a class=":: hover:text-menu-transition block " href={`/archives/?year=${val[0]}`}>
                        <p>{val[0]}（{val[1]}）</p>
                    </a>
                ))}
            </div>
        </div >
    )
}

export default Archives;