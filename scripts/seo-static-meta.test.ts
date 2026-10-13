import { expect, test } from 'bun:test';
import { structuredData } from '../src/site/seo/structuredData';
test('home schema stays a Blog while article metadata stays per page', () => {
  expect(structuredData({path:'/',title:'Home',description:'Site'})['@type']).toBe('Blog');
  const article=structuredData({path:'/posts/demo/',title:'Demo',description:'Article',date:'2026-01-01',updated:'2026-02-01',words:123});
  if (article['@type'] !== 'BlogPosting') throw new Error('Expected article schema');
  expect(article['@type']).toBe('BlogPosting');
  expect(article.dateModified).toBe('2026-02-01');
  expect(article.wordCount).toBe(123);
});
