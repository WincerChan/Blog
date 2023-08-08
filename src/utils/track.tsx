import Plausible from "plausible-tracker";
const { trackPageview, trackEvent } = Plausible({
    domain: "blog.itswincer.com",
    apiHost: "https://track.itswincer.com",
    trackLocalhost: true
})


export { trackPageview, trackEvent };

