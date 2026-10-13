import { onMount } from 'solid-js';
import BackTop from '~/site/widgets/BackTop';
import UpdateNotify from '~/features/pwa/UpdateNotify';
import { registerServiceWorker } from '~/utils/sw';
export default function FooterControls() {
    onMount(() => { if (import.meta.env.PROD) registerServiceWorker(); });
    return <><BackTop /><UpdateNotify /></>;
}
