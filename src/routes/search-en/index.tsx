import PageRouteView from "~/pages/PageRouteView";
import SearchPage from "~/pages/SearchPage";

export default function SearchEnRoute() {
    const slug = () => "search-en";

    return (
        <PageRouteView
            slug={slug}
            view={SearchPage}
            layout="article-no-comment"
            withChildren={true}
        />
    );
}
