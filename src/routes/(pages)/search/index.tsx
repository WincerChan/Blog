import PageRouteView from "~/pages/PageRouteView";
import SearchPage from "~/pages/SearchPage";

export default function SearchRoute() {
    const slug = () => "search";

    return (
        <PageRouteView
            slug={slug}
            view={SearchPage}
            layout="article-no-comment"
            withChildren={true}
        />
    );
}
