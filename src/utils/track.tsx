import Plausible from "plausible-tracker";
const { trackPageview, trackEvent } = Plausible({
    domain: "blog.itswincer.com",
    apiHost: "https://track.itswincer.com",
})


export { trackEvent, trackPageview };

