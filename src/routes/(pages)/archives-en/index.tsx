import PageRouteView from "~/features/pages/PageRouteView";
import ArchivesPage from "~/features/pages/ArchivesPage";

export default function ArchivesEnRoute() {
    const slug = () => "archives-en";

    return <PageRouteView slug={slug} view={ArchivesPage} layout="simple" />;
}
