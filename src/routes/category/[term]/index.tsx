import { createAsync, useParams } from "@solidjs/router";
import { createMemo } from "solid-js";
import CategoryPageView from "~/features/pages/CategoryPage";
import { getPostsByCategory, postUrl } from "~/content/velite";

export default function CategoryPage() {
    const params = useParams();
    const term = createMemo(() => decodeURIComponent(params.term));
    const resource = createAsync(() => getPostsByCategory(term())) as any;
    const posts = createMemo(() =>
        ((import.meta.env.SSR ? resource() : resource.latest) ?? []).map((p) => ({
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
