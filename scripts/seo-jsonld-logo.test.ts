import { expect, test } from 'bun:test';
import { structuredData } from '../src/site/seo/structuredData';
test('article structured data includes local logo and canonical URL', () => {
  const data = structuredData({path:'/posts/demo/',title:'Demo',description:'Description',lang:'en'});
  if (data['@type'] !== 'BlogPosting') throw new Error('Expected article schema');
  expect(data.publisher?.logo.url).toBe('https://blog.itswincer.com/favicon/generated/logo-512.png');
  expect(data.mainEntityOfPage?.['@id']).toBe('https://blog.itswincer.com/posts/demo/');
  expect(data.inLanguage).toBe('en');
});
