const notifySwUpdateReady = () => {
    window.dispatchEvent(new CustomEvent("sw:update-ready"));
};

const registerServiceWorker = () => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker
        .register(`/sw.js?v=${__SW_HASH}`, { scope: "/" })
        .then((reg) => {
            reg.addEventListener("updatefound", () => {
                const newWorker = reg.installing;
                newWorker?.addEventListener("statechange", () => {
                    if (newWorker.state !== "installed") return;
                    if (navigator.serviceWorker.controller) notifySwUpdateReady();
                });
            });
        });
};

export { registerServiceWorker };
