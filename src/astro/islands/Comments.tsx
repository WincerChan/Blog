import Comments from '~/features/article/comments/Comment';
// Only the label is needed; do not ship the site's translation dictionaries.
export default function CommentsIsland(props: { pageURL: string; lang?: string }) {
  return <Comments pageURL={props.pageURL} title={props.lang === 'en' ? 'Comments' : '评论'} />;
}
