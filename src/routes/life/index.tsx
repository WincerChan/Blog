import PageRouteView from "~/pages/PageRouteView";
import LifePage from "~/pages/LifePage";

export default function LifeRoute() {
    const slug = () => "life";

    return <PageRouteView slug={slug} view={LifePage} layout="article" withChildren={true} />;
}
