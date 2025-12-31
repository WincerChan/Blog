import PageRouteView from "~/features/pages/PageRouteView";
import ArchivesPage from "~/features/pages/ArchivesPage";

export default function ArchivesRoute() {
    const slug = () => "archives";

    return <PageRouteView slug={slug} view={ArchivesPage} layout="simple" />;
}
