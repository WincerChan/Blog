import { useI18nContext } from "~/i18n/i18n-solid";
import TagCollection from "../section/Tag";

const Tags = () => {
    const { LL, locale } = useI18nContext()
    return (
        <div class="<md:hidden">
            <label class=":: font-headline text-[var(--subtitle)]">{LL().footer.T()}</label>
            <div class=":: flex-wrap gap-x-3 flex justify-between ">
                <TagCollection tags={__TAGS} />
            </div>
        </div>
    )
}
export default Tags