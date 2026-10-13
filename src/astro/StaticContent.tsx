// These Solid components render only at build time; no client:* directive.
import Locale from './islands/Locale';
import IconArrowRight from "~icons/ph/arrow-right";
import Latest from '~/features/home/LatestCard';
import Other from '~/features/post-listing/OtherCards';
import PostMeta from '~/features/article/blocks/PostMeta';
import Copyright from '~/features/article/blocks/Copyright';
import Relates from '~/features/article/blocks/Relates';
import Neighbours from '~/features/article/blocks/Neighbours';
import { useI18nContext } from '~/i18n/i18n-solid';
function Metadata(props: any) { const { LL, locale } = useI18nContext(); return <PostMeta blog={props.blog} LL={LL as any} lang={locale} />; }
function Extras(props: any) { const { LL } = useI18nContext(); return <><Copyright updated={new Date(props.blog.updated ?? props.blog.date)} /><Relates relates={props.blog.relates ?? []} LL={LL as any} /><Neighbours neighbours={props.blog.neighbours} LL={LL as any} /></>; }
export function ArticleMetadata(props: any) { return <Locale lang={props.blog.lang}><Metadata blog={props.blog} /></Locale>; }
export function ArticleExtras(props: any) { return <Locale lang={props.blog.lang}><Extras blog={props.blog} /></Locale>; }
export default function HomeContent(props: any) {
  const posts = props.posts.map((p: any) => ({ ...p, slug: p.url }));
  return <Locale><Latest blog={posts[0]} /><div class="mt-8 mb-4 flex items-end justify-between gap-4"><h3 class="text-base md:text-lg font-semibold text-[var(--c-text-subtle)]">近期文章</h3><a class="group inline-flex items-center gap-1 text-sm font-medium text-[var(--c-text)] hover:text-[var(--c-link)] transition-colors" href="/archives/">查看更多文章<IconArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-1" /></a></div><Other posts={() => posts.slice(1)} description={null} /></Locale>;
}

import FooterNav from '~/site/footer';
import Archives from '~/features/pages/ArchivesPage';
import Category from '~/features/pages/CategoryPage';
import Friends from '~/features/pages/FriendsPage';
export function SiteFooter(props: any) { return <Locale lang={props.lang}><FooterNav {...props} /></Locale>; }
export function ArchiveContent(props: any) { return <Locale lang={props.page.lang}><Archives {...props} /></Locale>; }
export function CategoryContent(props: any) { return <Locale><Category {...props} /></Locale>; }
export function FriendsContent(props: any) { return <Locale lang={props.page.lang}><Friends {...props} /></Locale>; }
