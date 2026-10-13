import { createEffect } from 'solid-js';
import Locale from './Locale';
import Header from '~/site/header';
import { globalStore, applyTheme } from '~/features/theme';
export default function HeaderIsland(props: { lang: string; pages: Array<{slug: string; title: string}> }) {
    createEffect(() => applyTheme(globalStore.theme));
    return <Locale lang={props.lang}><Header pages={props.pages} /></Locale>;
}
