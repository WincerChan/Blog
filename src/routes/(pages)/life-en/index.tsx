import PageRouteView from "~/features/pages/PageRouteView";
import LifePage from "~/features/pages/LifePage";

export default function LifeEnRoute() {
    const slug = () => "life-en";

    return <PageRouteView slug={slug} view={LifePage} layout="article" withChildren={true} />;
}
