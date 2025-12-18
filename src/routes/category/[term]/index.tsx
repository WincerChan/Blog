import { createAsync, useParams } from "@solidjs/router";
import { createMemo } from "solid-js";
import CategoryPageView from "~/modules/category/CategoryPage";
import { getPostsByCategory, postUrl } from "~/content/velite";

export default function CategoryPage() {
    const params = useParams();
    const term = createMemo(() => decodeURIComponent(params.term));
    const resource = createAsync(() => getPostsByCategory(term()));
    const posts = createMemo(() =>
        (resource() ?? []).map((p) => ({
            ...p,
            slug: (p as any).url ?? postUrl(String((p as any).slug)),
        })),
    );
    return (
        <CategoryPageView
            rawTaxo={{ term: term(), pages: posts() as any }}
            type="分类"
            basePath="/category"
        />
    );
}
