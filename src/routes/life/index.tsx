import { Suspense, lazy } from "solid-js";
import EmptyLayout from "~/components/layouts/EmptyLayout";


const Life = lazy(() => import("~/components/page/Life"))

const LazyLife = () => {
    return (
        <Suspense fallback={<EmptyLayout />}>
            <Life />
        </Suspense>
    )
}

export default LazyLife;

