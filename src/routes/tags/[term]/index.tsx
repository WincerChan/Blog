import { useParams } from "@solidjs/router";
import { createMemo } from "solid-js";
import TaxoLayout from "~/components/layouts/TaxoLayout";
import { getPostsByTag, postUrl } from "~/content/velite";

export default function TagPage() {
    const params = useParams();
    const term = createMemo(() => decodeURIComponent(params.term));
    const posts = createMemo(() =>
        getPostsByTag(term()).map((p) => ({
            ...p,
            slug: postUrl(p.slug),
        })),
    );
    return (
        <TaxoLayout
            rawTaxo={{ term: term(), pages: posts() as any }}
            type="标签"
            basePath="/tags"
        />
    );
}

