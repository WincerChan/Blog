import { Suspense, lazy } from "solid-js";

const Friends = lazy(() => import("~/components/page/Friends"))

const LazyFriends = () => {
    return (
        <Suspense>
            <Friends />
        </Suspense >
    )
}

export default LazyFriends;

