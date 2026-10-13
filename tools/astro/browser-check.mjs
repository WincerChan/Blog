import assert from 'node:assert/strict';
import { createCipheriv, pbkdf2Sync, randomBytes } from 'node:crypto';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright');

const base = process.env.ASTRO_TEST_URL || 'http://127.0.0.1:4176';
const output = process.env.ASTRO_TEST_OUTPUT || '/tmp/blog-astro-browser';
fs.mkdirSync(output, { recursive: true });
const post = '/posts/solana-vanity-prefix-vs-suffix-probability/';
const encryptedPost = '/posts/d67271d8/';
const discussion = 'https://github.com/example/blog-comments/discussions/1';
const password = 'article-control-fixture-password';
const salt = randomBytes(16), iv = randomBytes(12);
const cipher = createCipheriv('aes-256-gcm', pbkdf2Sync(password, salt, 120000, 32, 'sha256'), iv);
const plaintext = '<p id="decrypted-fixture">Decrypted browser fixture</p>';
const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
const payload = ['v1', salt.toString('base64'), iv.toString('base64'), cipher.getAuthTag().toString('base64'), encrypted.toString('base64')].join(':');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];

async function makePage({ width = 1280, colorScheme = 'light', comments = [], discussionUrl = discussion, failComments = false, decryptFixture = false } = {}) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, colorScheme, serviceWorkers: 'block' });
    // Playwright's blocked registration resolves without a registration object.
    // Model an unsupported browser so the app follows its existing SW guard.
    await context.addInitScript(() => { delete Navigator.prototype.serviceWorker; });
    const page = await context.newPage();
    const errors = [];
    let replacements = 0;
    page.on('pageerror', e => errors.push(e.message));
    await page.route('**/*', async route => {
        const url = new URL(route.request().url());
        if (url.origin === base) {
            if (decryptFixture && (url.pathname === encryptedPost || url.pathname === '/_data/posts/d67271d8.json')) {
                const response = await route.fetch();
                let body = await response.text();
                body = body.replace(/v1:[A-Za-z0-9+/=]+:[A-Za-z0-9+/=]+:[A-Za-z0-9+/=]+:[A-Za-z0-9+/=]+/g, () => { replacements++; return payload; });
                await route.fulfill({ response, body });
            } else await route.continue();
            return;
        }
        if (url.pathname.startsWith('/v2/')) {
            const headers = { 'access-control-allow-origin': base, 'access-control-allow-credentials': 'true' };
            if (url.pathname.endsWith('/comments')) {
                await route.fulfill({ status: failComments ? 503 : 200, headers, json: { total: comments.length, comments, discussion_url: discussionUrl } });
            } else await route.fulfill({ headers, json: { count: 0, interacted: false } });
        } else await route.abort();
    });
    return { context, page, errors, replacements: () => replacements };
}

try {
    for (const kind of ['legacy', 'empty', 'fallback', 'missing']) {
        const comments = kind === 'legacy' ? [{ id: 'legacy-fixture', author_login: 'Fixture reader', body_html: '<p>Fixture legacy comment</p>', created_at: '2026-09-01', source: 'legacy' }] : [];
        const { context, page, errors } = await makePage({ comments, failComments: kind === 'fallback', discussionUrl: kind === 'missing' ? null : discussion });
        try {
            await page.goto(base + post);
            await page.locator('main h1').waitFor();
            if (kind === 'fallback' || kind === 'missing') {
                await page.evaluate(({ kind, discussion }) => {
                    document.querySelectorAll('meta[name="inkstone:discussion"]').forEach(el => el.remove());
                    if (kind === 'fallback') {
                        const el = document.createElement('meta'); el.name = 'inkstone:discussion'; el.content = discussion; document.head.append(el);
                    }
                }, { kind, discussion });
            }
            await page.locator('#comments').scrollIntoViewIfNeeded();
            const reply = page.getByRole('link', { name: 'Reply on GitHub', exact: true });
            if (kind === 'missing') {
                await page.getByText('尚未创建讨论', { exact: true }).waitFor();
                assert.equal(await reply.count(), 0);
            } else {
                await reply.waitFor({ state: 'visible' });
                assert.equal(await reply.getAttribute('href'), discussion);
                assert.equal(await reply.getAttribute('target'), '_blank');
                if (kind === 'legacy') {
                    const comment = page.getByText('Fixture legacy comment', { exact: true });
                    await comment.waitFor();
                    assert.equal(await page.getByRole('button', { name: 'Reply', exact: true }).count(), 0);
                    const commentBox = await comment.boundingBox(), replyBox = await reply.boundingBox();
                    assert(replyBox.y > commentBox.y + commentBox.height);
                    await page.locator('#comments').screenshot({ path: output + '/comments.png' });
                }
            }
            assert.deepEqual(errors, []);
            results.push('PASS comments: ' + kind);
        } finally { await context.close(); }
    }

    for (const colorScheme of ['light', 'dark']) {
        for (const width of [1280, 375]) {
            const { context, page, errors, replacements } = await makePage({ colorScheme, width, decryptFixture: true });
            try {
                await page.goto(base + encryptedPost);
                const input = page.getByLabel('文章密码');
                await input.waitFor({ state: 'visible' });
                assert.equal(await input.getAttribute('type'), 'password');
                const form = page.locator('form').filter({ has: input });
                const button = page.getByRole('button', { name: '解密', exact: true });
                const styles = await input.evaluate(el => {
                    const css = getComputedStyle(el);
                    return { border: css.borderTopWidth, padding: css.paddingLeft, background: css.backgroundColor, height: el.getBoundingClientRect().height };
                });
                assert(parseFloat(styles.border) >= 1);
                assert(parseFloat(styles.padding) >= 12);
                assert(styles.height >= 44);
                assert.notEqual(styles.background, 'rgba(0, 0, 0, 0)');
                assert.equal(await page.locator('html').getAttribute('class'), colorScheme);
                const inputBox = await input.boundingBox(), buttonBox = await button.boundingBox();
                if (width < 640) assert(buttonBox.y >= inputBox.y + inputBox.height);
                else assert(Math.abs(buttonBox.y - inputBox.y) < 2);
                assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
                await form.screenshot({ path: output + '/password-' + colorScheme + '-' + width + '.png' });
                await button.click();
                await page.getByRole('alert').filter({ hasText: '请输入密码。' }).waitFor();
                await input.fill('wrong-fixture-password');
                await input.press('Enter');
                await page.getByRole('alert').filter({ hasText: '密码错误或解密失败。' }).waitFor();
                assert.equal(await input.getAttribute('aria-invalid'), 'true');
                assert(await button.isEnabled());
                assert(replacements() > 0);
                await input.fill(password);
                await input.press('Enter');
                await page.locator('#decrypted-fixture').waitFor();
                assert.equal(await page.getByRole('alert').count(), 0);
                assert.equal(await input.count(), 0);
                assert.deepEqual(errors, []);
                results.push('PASS password: ' + colorScheme + ' ' + width + 'px, blank/wrong/correct');
            } finally { await context.close(); }
        }
    }
    for (const width of [1440, 375]) {
        const { context, page, errors } = await makePage({ width });
        try {
            await page.goto(base + post);
            await page.getByTitle('Switch Theme').click();
            await page.getByText('深色模式', { exact: true }).click();
            assert.equal(await page.locator('html').getAttribute('class'), 'dark');
            if (width === 375) {
                await page.getByRole('button', { name: 'Open table of contents' }).click();
                assert.equal(await page.locator('body').evaluate(el => el.style.overflow), 'hidden');
                await page.getByRole('button', { name: '关闭', exact: true }).click();
                assert.equal(await page.locator('body').evaluate(el => el.style.overflow), '');
            } else {
                const first = page.locator('#toc a').first();
                await first.click();
                await page.waitForFunction(() => location.hash.length > 1);
                assert(await first.evaluate(el => el.classList.contains('font-medium')));
            }
            await page.evaluate(() => { window.__islandNavigation = 42; });
            const next = page.locator('article a[href^="/posts/"]').first();
            const href = await next.getAttribute('href');
            await next.click();
            await page.waitForURL('**' + href);
            await page.waitForTimeout(500);
            assert(await page.evaluate(() => window.__islandNavigation === 42));
            assert.equal(await page.locator('html').getAttribute('class'), 'dark');
            await page.evaluate(() => { window.__backReady = false; document.addEventListener('astro:page-load', () => { window.__backReady = true; }, { once: true }); });
            await page.goBack();
            await page.waitForURL('**' + post + '*');
            await page.waitForFunction(() => window.__backReady);
            await page.getByTitle('Like', { exact: true }).evaluate(el => el.scrollIntoView({ block: 'center' }));
            await page.locator('astro-island[component-export="default"][component-url*="PostActions"]:not([ssr])').waitFor({ state: 'attached' });
            await page.getByTitle('Like', { exact: true }).click();
            await page.locator('button[title$="人已点赞"]').waitFor();
            assert(await page.locator('button[title$="人已点赞"]').isDisabled());
            await page.screenshot({ path: output + '/article-dark-' + width + '.png' });
            assert.deepEqual(errors, []);
            results.push('PASS navigation, theme, ToC and mocked like: ' + width + 'px');
        } finally { await context.close(); }
    }
    fs.writeFileSync(output + '/browser-results.json', JSON.stringify(results, null, 2));
    console.log(results.join('\n'));
} finally { await browser.close(); }
