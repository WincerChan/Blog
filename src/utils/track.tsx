import Plausible from "plausible-tracker";
const { enableAutoPageviews, trackEvent } = Plausible({
    domain: "blog.itswincer.com",
    apiHost: "https://track.itswincer.com",
})


export { enableAutoPageviews, trackEvent };

