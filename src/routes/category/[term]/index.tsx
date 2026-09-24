import { useParams } from "@solidjs/router";
import { createMemo } from "solid-js";
import CategoryPageView from "~/features/pages/CategoryPage";
import { getPostsByCategory, postUrl } from "~/content/velite";

const decodeTerm = (value: string | undefined) => {
    if (!value) return "";
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
};

export default function CategoryPage() {
    const params = useParams();
    const term = createMemo(() => decodeTerm(params.term));
    const resource = createMemo(async () => getPostsByCategory(term()));
    const payload = createMemo(() => resource() ?? { items: [], inkstoneToken: "" });
    const posts = createMemo(() =>
        payload().items.map((p) => ({
            ...p,
            slug: (p as any).url ?? postUrl(String((p as any).slug)),
        })),
    );
    return (
        <CategoryPageView
            rawTaxo={{ term: term(), pages: posts() as any }}
            type="分类"
            basePath="/category"
            inkstoneToken={payload().inkstoneToken}
        />
    );
}
