import { Suspense, lazy } from "solid-js";
const Archives = lazy(() => import("~/components/page/Archives"))


const LazyArchives = () => {
    return (
        <Suspense>
            <Archives />
        </Suspense>
    )
}

export default LazyArchives;

