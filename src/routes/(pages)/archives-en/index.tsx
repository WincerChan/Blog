import PageRouteView from "~/pages/PageRouteView";
import ArchivesPage from "~/pages/ArchivesPage";

export default function ArchivesEnRoute() {
    const slug = () => "archives-en";

    return <PageRouteView slug={slug} view={ArchivesPage} layout="simple" />;
}
