import { createSignal, onMount, onCleanup } from 'solid-js';

/** Query-only history updates keep the search island alive. Preserve Astro's history state. */
export function useSearchParams() {
    const [params, setParams] = createSignal<Record<string, string>>({});
    const sync = () => setParams(Object.fromEntries(new URLSearchParams(location.search)));
    onMount(() => {
        sync();
        window.addEventListener('popstate', sync);
        onCleanup(() => window.removeEventListener('popstate', sync));
    });
    const view = new Proxy({} as Record<string, string>, { get: (_, key: string) => params()[key] });
    const update = (values: Record<string, string | undefined>) => {
        const url = new URL(location.href);
        url.search = new URLSearchParams(Object.entries(values).filter((entry): entry is [string, string] => entry[1] !== undefined)).toString();
        history.pushState(history.state, '', url);
        sync();
    };
    return [view, update] as const;
}
