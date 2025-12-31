import PageRouteView from "~/features/pages/PageRouteView";
import SearchPage from "~/features/pages/SearchPage";

export default function SearchEnRoute() {
    const slug = () => "search-en";

    return (
        <PageRouteView
            slug={slug}
            view={SearchPage}
            layout="simple"
        />
    );
}
