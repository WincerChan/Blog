import PageRouteView from "~/features/pages/PageRouteView";
import FriendsPage from "~/features/pages/FriendsPage";

export default function FriendsRoute() {
    const slug = () => "friends";

    return <PageRouteView slug={slug} view={FriendsPage} layout="article" withChildren={true} />;
}
