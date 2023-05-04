import { Suspense, lazy } from "solid-js";
import EmptyLayout from "~/components/layouts/EmptyLayout";
const Archives = lazy(() => import("~/components/page/Archives"))


const LazyArchives = () => {
    return (
        <Suspense fallback={<EmptyLayout />}>
            <Archives />
        </Suspense>
    )
}

export default LazyArchives;

