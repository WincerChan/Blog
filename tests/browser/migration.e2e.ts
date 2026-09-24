import { expect, test, type Page } from "@playwright/test";

const codePost = "/posts/solana-vanity-prefix-vs-suffix-probability/";

test.beforeEach(async ({ page }) => {
    // Keep behavioral tests independent of live services and never write real analytics or kudos.
    await page.route(/\/v2\//, async route => {
        const url = new URL(route.request().url());
        const headers = { "access-control-allow-origin": "http://127.0.0.1:4174", "access-control-allow-credentials": "true" };
        let json: unknown = {};
        if (url.pathname.endsWith("/kudos")) {
            json = { count: route.request().method() === "POST" ? 4 : 3, interacted: false };
        } else if (url.pathname.endsWith("/comments")) {
            json = { total: 1, discussion_url: "https://github.com/example/discussions/1", comments: [
                { id: "test-comment", author_login: "Fixture author", body_html: "<p>Fixture comment</p>", created_at: "2026-01-01", source: "legacy" },
            ] };
        } else if (url.pathname.endsWith("/douban/marks")) {
            json = { items: [{ title: "Fixture book", poster: "/favicon/light.svg", date: "2026-01-01", type: "book", url: "https://example.com/book" }] };
        } else if (url.pathname.endsWith("/search")) {
            const pageNumber = Math.floor(Number(url.searchParams.get("offset") ?? 0) / 8) + 1;
            json = { total: 9, elapsed_ms: pageNumber, hits: [{ title: `Fixture result ${pageNumber}`, url: `https://itswincer.com${codePost}`, published_at: "2026-01-01", content: "Fixture snippet", tags: [] }] };
        }
        await route.fulfill({ json, headers });
    });
});

function collectErrors(page: Page) {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => {
        // HTTP failures are exercised separately; include errors caught by the app boundary.
        if (message.type() === "error" && !message.text().startsWith("Failed to load resource:")) {
            errors.push(message.text());
        }
    });
    return errors;
}

test("favicons survive SSR and hydration and load the SVG matching the system theme", async ({ browser }) => {
    for (const colorScheme of ["light", "dark"] as const) {
        const context = await browser.newContext({ colorScheme, serviceWorkers: "block" });
        try {
            const page = await context.newPage();
            const cdp = await context.newCDPSession(page);
            const requested: string[] = [];
            await cdp.send("Network.enable");
            cdp.on("Network.requestWillBeSent", event => requested.push(new URL(event.request.url).pathname));
            const response = await page.goto("http://127.0.0.1:4174/");
            const html = await response!.text();
            const staticIcons = await page.evaluate(source => {
                const document = new DOMParser().parseFromString(source, "text/html");
                return Array.from(document.querySelectorAll('link[rel="icon"]'), link => link.getAttribute("href"));
            }, html);
            expect(staticIcons.sort()).toEqual(["/favicon/dark.svg", "/favicon/light.svg"]);
            await expect(page.locator('head link[rel="icon"]')).toHaveCount(2);
            await expect.poll(() => requested.includes(`/favicon/${colorScheme}.svg`)).toBe(true);
            expect(requested).not.toContain("/favicon.ico");
            await page.locator('header a[href="/archives/"]').click();
            await expect(page).toHaveTitle("归档 · Wincer's Blog");
            await expect(page.locator('head link[rel="icon"]')).toHaveCount(2);
        } finally {
            await context.close();
        }
    }
});

test("hydrates and navigates without replacing the document; updates locale and head", async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto("/");
    await expect(page.locator("main h2").first()).toBeVisible();
    await page.evaluate(() => { (window as any).__navigationSentinel = "preserved"; });
    await page.locator('header a[href="/archives/"]').click();
    await expect(page).toHaveTitle("归档 · Wincer's Blog");
    await expect(page.locator('main a[href^="/posts/"]').first()).toBeVisible();
    expect(await page.evaluate(() => (window as any).__navigationSentinel)).toBe("preserved");
    await page.goto(codePost);
    await page.locator('a[href="/posts/solana-vanity-prefix-vs-suffix-probability-en/"]').first().click();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page).toHaveTitle("Solana Address Prefix Character Probability Analysis · Wincer's Blog");
    await expect(page.locator('head link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('head meta[name="description"]')).toHaveCount(1);
    expect(errors).toEqual([]);
});

test("theme selection survives reload and mobile navigation unlocks scrolling", async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto("/");
    await page.getByTitle("Switch Theme").click();
    await page.getByText("深色模式", { exact: true }).click();
    await expect(page.locator("html")).toHaveClass("dark");
    await page.reload();
    await expect(page.locator("html")).toHaveClass("dark");
    await page.setViewportSize({ width: 390, height: 844 });
    const menu = page.locator('header button[aria-expanded]');
    await menu.click();
    await expect(menu).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
    await page.locator('nav:visible a[href="/archives/"]').click();
    await expect(page).toHaveTitle("归档 · Wincer's Blog");
    await expect(menu).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
    expect(errors).toEqual([]);
});

test("automatic theme follows the system while an explicit preference stays fixed", async ({ page }) => {
    const errors = collectErrors(page);
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    await expect(page.locator("html")).toHaveClass("light");
    await page.emulateMedia({ colorScheme: "dark" });
    await expect(page.locator("html")).toHaveClass("dark");
    await page.getByTitle("Switch Theme").click();
    await page.getByText("浅色模式", { exact: true }).click();
    await expect(page.locator("html")).toHaveClass("light");
    await page.emulateMedia({ colorScheme: "light" });
    await page.emulateMedia({ colorScheme: "dark" });
    await expect(page.locator("html")).toHaveClass("light");
    await page.getByTitle("Switch Theme").click();
    await page.getByText("跟随系统", { exact: true }).click();
    await expect(page.locator("html")).toHaveClass("dark");
    await page.emulateMedia({ colorScheme: "light" });
    await expect(page.locator("html")).toHaveClass("light");
    expect(errors).toEqual([]);
});

test("search submits, changes pages and sort, and restores the URL after back navigation", async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto("/search/");
    const input = page.getByRole("textbox", { name: "Search" });
    await input.fill("solid");
    await input.press("Enter");
    await expect(page).toHaveURL(/q=solid/);
    await expect(page.getByText("Fixture result 1", { exact: true })).toBeVisible();
    await page.getByTitle("Next", { exact: true }).click();
    await expect(page.getByText("Fixture result 2", { exact: true })).toBeVisible();
    await expect(page.getByText("找到 9 条记录，耗时 2ms")).toBeVisible();
    await page.getByRole("button", { name: "最新", exact: true }).click();
    await expect(page).toHaveURL(/sort=latest/);
    await expect(page.getByText("Fixture result 1", { exact: true })).toBeVisible();
    await page.goBack();
    await expect(page).not.toHaveURL(/sort=latest/);
    await expect(input).toHaveValue("solid");
    expect(errors).toEqual([]);
});

test("async search can recover from an API failure", async ({ page }) => {
    const errors = collectErrors(page);
    await page.route(/\/v2\/search\?/, route => route.fulfill({ status: 503, body: "unavailable" }), { times: 1 });
    await page.goto("/search/?q=first");
    await expect(page.getByText(/搜索出错了/)).toBeVisible();
    const input = page.getByRole("textbox", { name: "Search" });
    await input.fill("second");
    await input.press("Enter");
    await expect(page.getByText("Fixture result 1", { exact: true })).toBeVisible();
    await expect(page.getByText(/搜索出错了/)).toHaveCount(0);
    expect(errors).toEqual([]);
});

test("article code roots support copy; lazy comments and kudos load and update", async ({ page, context }) => {
    const errors = collectErrors(page);
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto(codePost);
    const copy = page.locator(".code-header button").first();
    await expect(copy).toBeVisible();
    await copy.click();
    await expect(copy).toContainText("已复制");
    expect(await page.evaluate(() => navigator.clipboard.readText())).not.toBe("");
    await page.locator("#comments").scrollIntoViewIfNeeded();
    await expect(page.getByText("Fixture comment", { exact: true })).toBeVisible();
    const like = page.getByTitle("Like", { exact: true });
    await like.scrollIntoViewIfNeeded();
    await expect(like).toContainText("3");
    await like.click();
    await expect(page.getByTitle("4 人已点赞")).toBeDisabled();
    await page.locator('header a[href="/archives/"]').click();
    await expect(page).toHaveTitle("归档 · Wincer's Blog");
    expect(errors).toEqual([]);
});

test("life data renders and encrypted articles reject a wrong password", async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto("/life/");
    await expect(page.getByText("Fixture book", { exact: true })).toBeVisible();
    await page.goto("/posts/d67271d8/");
    await page.getByPlaceholder(/输入密码/).fill("incorrect-migration-test-password");
    await page.getByTitle("解密", { exact: true }).click();
    await expect(page.getByText("密码错误或解密失败。", { exact: true })).toBeVisible();
    await expect(page.getByTitle("解密", { exact: true })).toBeEnabled();
    expect(errors).toEqual([]);
});

test("static HTML works without JavaScript and ships working math styles", async ({ browser, request }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    try {
        await page.goto(`http://127.0.0.1:4174${codePost}`);
        await expect(page.locator('script[type="module"][src]')).toHaveCount(1);
        await expect(page.locator('script[type="module"][src]')).not.toHaveAttribute("async");
        await expect(page.locator("main h1")).toContainText("Solana");
        expect(await page.locator(".katex").count()).toBeGreaterThan(0);
        const styles = await page.locator('link[rel="stylesheet"]').evaluateAll(links => links.map(link => (link as HTMLLinkElement).href));
        expect(styles.some(url => url.includes("katex"))).toBe(true);
        for (const url of styles) expect((await request.get(url)).ok()).toBe(true);
    } finally {
        await context.close();
    }
});

test("the explicit 404 page survives serialized not-found data and hydration", async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto("/404/");
    await page.getByTitle("Switch Theme").click();
    await page.getByText("深色模式", { exact: true }).click();
    await expect(page.locator("main h1")).toHaveText("404 Not Found");
    await expect(page).toHaveTitle("404 Not Found · Wincer's Blog");
    expect(errors).toEqual([]);
});
