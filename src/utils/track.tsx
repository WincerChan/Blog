import Plausible from "plausible-tracker";
const { trackPageview, trackEvent } = Plausible.default({
    domain: "blog.itswincer.com",
    apiHost: "https://track.itswincer.com",
})


export { trackEvent, trackPageview };

