import { Suspense, lazy } from "solid-js";


const Life = lazy(() => import("~/components/page/Life"))

const LazyLife = () => {
    return (
        <Suspense>
            <Life />
        </Suspense>
    )
}

export default LazyLife;

