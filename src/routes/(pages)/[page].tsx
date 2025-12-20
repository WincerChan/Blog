import { useParams } from "@solidjs/router";
import { createMemo } from "solid-js";
import PageRouteView from "~/features/pages/PageRouteView";

export default function PageRoute() {
    const params = useParams();
    const slug = createMemo(() => String(params.page || ""));

    return <PageRouteView slug={slug} />;
}
