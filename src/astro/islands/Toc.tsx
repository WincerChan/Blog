import ToC from '~/features/article/components/ToC';
export default function Toc(props: { toc: string; slug: string; lang?: string }) {
  return <ToC toc={props.toc} slug={props.slug} label={props.lang === 'en' ? 'TOC' : '目录'} />;
}
