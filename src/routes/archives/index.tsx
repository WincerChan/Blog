import PageRouteView from "~/pages/PageRouteView";
import ArchivesPage from "~/pages/ArchivesPage";

export default function ArchivesRoute() {
    const slug = () => "archives";

    return <PageRouteView slug={slug} view={ArchivesPage} layout="simple" />;
}
