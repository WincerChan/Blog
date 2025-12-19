import PageRouteView from "~/pages/PageRouteView";
import FriendsPage from "~/pages/FriendsPage";

export default function FriendsRoute() {
    const slug = () => "friends";

    return <PageRouteView slug={slug} view={FriendsPage} layout="article" withChildren={true} />;
}
