import { Suspense, lazy } from "solid-js";
import EmptyLayout from "~/components/layouts/EmptyLayout";

const Friends = lazy(() => import("~/components/page/Friends"))

const LazyFriends = () => {
    return (
        <Suspense fallback={<EmptyLayout />}>
            <Friends />
        </Suspense >
    )
}

export default LazyFriends;

