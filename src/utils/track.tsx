import { createTracker } from "@wincer/inkstone-track";
import { INKSTONE_BASE } from "~/utils/inkstone";

const siteHost = (() => {
    try {
        return new URL(__SITE_CONF.baseURL).host;
    } catch {
        return "";
    }
})();

const tracker = createTracker({
    baseUrl: INKSTONE_BASE,
    siteHost,
    isDev: Boolean(import.meta.env?.DEV),
});

const trackEngage = (useBeacon = false) => tracker.trackEngage(useBeacon);
const trackPage = (pathname?: string, token?: string) => tracker.trackPage(pathname, token);

export { trackEngage, trackPage };
