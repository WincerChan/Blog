import { useParams } from "@solidjs/router";
import { createMemo } from "solid-js";
import TaxonomyPageLayout from "~/components/layouts/pages/TaxonomyPageLayout";
import { getPostsByCategory, postUrl } from "~/content/velite";

export default function CategoryPage() {
    const params = useParams();
    const term = createMemo(() => decodeURIComponent(params.term));
    const posts = createMemo(() =>
        getPostsByCategory(term()).map((p) => ({
            ...p,
            slug: postUrl(p.slug),
        })),
    );
    return (
        <TaxonomyPageLayout
            rawTaxo={{ term: term(), pages: posts() as any }}
            type="分类"
            basePath="/category"
        />
    );
}
