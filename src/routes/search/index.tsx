import { Suspense, lazy } from "solid-js";
import EmptyLayout from "~/components/layouts/EmptyLayout";

const Search = lazy(() => import("~/components/page/Search"))

const LazySearch = () => {
    return (
        <Suspense fallback={<EmptyLayout />}>
            <Search />
        </Suspense>
    )
}

export default LazySearch;

