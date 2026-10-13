import type { JSX } from 'solid-js';
import TypesafeI18n from '~/i18n/i18n-solid';
import { loadLocale } from '~/i18n/i18n-util.sync';
export default function Locale(props: { lang?: string; children: JSX.Element }) {
  const locale = props.lang === 'en' ? 'en' : 'zh-CN';
  loadLocale(locale);
  return <TypesafeI18n locale={locale}>{props.children}</TypesafeI18n>;
}
