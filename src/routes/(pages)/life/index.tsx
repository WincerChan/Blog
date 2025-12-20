import PageRouteView from "~/features/pages/PageRouteView";
import LifePage from "~/features/pages/LifePage";

export default function LifeRoute() {
    const slug = () => "life";

    return <PageRouteView slug={slug} view={LifePage} layout="article" withChildren={true} />;
}
