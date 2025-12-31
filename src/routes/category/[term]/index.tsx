import { useParams } from "@solidjs/router";
import { createMemo, createResource } from "solid-js";
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
    const [resource] = createResource(term, getPostsByCategory);
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
