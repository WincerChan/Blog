import PageRouteView from "~/features/pages/PageRouteView";
import SearchPage from "~/features/pages/SearchPage";

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
