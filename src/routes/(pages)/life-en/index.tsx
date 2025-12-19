import PageRouteView from "~/pages/PageRouteView";
import LifePage from "~/pages/LifePage";

export default function LifeEnRoute() {
    const slug = () => "life-en";

    return <PageRouteView slug={slug} view={LifePage} layout="article" withChildren={true} />;
}
