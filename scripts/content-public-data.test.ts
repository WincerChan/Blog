import { createDecipheriv, pbkdf2Sync } from 'node:crypto';
import { expect, test } from 'bun:test';
import { buildPublicData } from '../tools/content/emit/publicData';
import { normalizeCommentPath } from '../tools/content/commentsMapping';

const post = { slug: 'demo', title: 'Demo', date: '2024-01-01', updated: '2024-01-02', html: '<p>hello</p>' };
const options = { pages: [], friends: [], tokenSecret: 'fixture' };

test('public content retains discussion links and math detection', async () => {
  const data = await buildPublicData({ ...options,
    posts: [post, { ...post, slug: 'math', html: '<span class="katex">x</span>' }],
    discussionMapping: new Map([[normalizeCommentPath('/posts/demo/'), 'https://github.com/org/repo/discussions/1']]),
  });
  expect(data.posts[0].discussionUrl).toBe('https://github.com/org/repo/discussions/1');
  expect(data.posts[0].hasMath).toBe(false);
  expect(data.posts[1].hasMath).toBe(true);
  expect(data.posts[1].discussionUrl).toBeUndefined();
  expect(data.posts[0].hasLegacyComments).toBeUndefined();
});

test('encrypted content strips secrets and decrypts with the existing browser format', async () => {
  const password = 'fixture-password';
  const data = await buildPublicData({ ...options, posts: [{ ...post, encrypt_pwd: password, rawContent: 'private markdown' }] });
  const encoded = JSON.stringify(data);
  expect(encoded).not.toContain(password);
  expect(encoded).not.toContain(post.html);
  expect(encoded).not.toContain('private markdown');
  expect(data.posts[0].encrypted).toBe(true);
  const [version, salt, iv, tag, payload] = data.posts[0].html.split(':');
  expect(version).toBe('v1');
  const key = pbkdf2Sync(password, Buffer.from(salt, 'base64'), 120000, 32, 'sha256');
  const cipher = createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64'));
  cipher.setAuthTag(Buffer.from(tag, 'base64'));
  expect(Buffer.concat([cipher.update(Buffer.from(payload, 'base64')), cipher.final()]).toString()).toBe(post.html);
});

test('removed or drafted posts disappear from all derived lists', async () => {
  const published = { ...post, category: 'Category' };
  const before = await buildPublicData({ ...options, posts: [published] });
  expect(before.posts).toHaveLength(1);
  expect(before.categories).toHaveLength(1);
  for (const posts of [[{ ...published, draft: true }], []]) {
    const after = await buildPublicData({ ...options, posts });
    expect(after.posts).toEqual([]);
    expect(after.latest.items).toEqual([]);
    expect(after.categories).toEqual([]);
    expect(after.categoryData).toEqual({});
  }
});
