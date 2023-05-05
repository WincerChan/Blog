import { Suspense, lazy } from "solid-js";

const Search = lazy(() => import("~/components/page/Search"))

const LazySearch = () => {
    return (
        <Suspense>
            <Search />
        </Suspense>
    )
}

export default LazySearch;

