import PageRouteView from "~/features/pages/PageRouteView";
import FriendsPage from "~/features/pages/FriendsPage";

export default function FriendsEnRoute() {
    const slug = () => "friends-en";

    return <PageRouteView slug={slug} view={FriendsPage} layout="article" withChildren={true} />;
}
