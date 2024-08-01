/// <reference types="@solidjs/start/env" />

export { }

declare global {
    interface Window {
        loadedLocale: boolean
    }
    var loadedLocale: boolean
    var renderCount: number
}