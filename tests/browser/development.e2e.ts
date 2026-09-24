import { expect, test } from "@playwright/test";

test("development runtime stays reactive, including nested code-block render roots", async ({ page, context }) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => {
        if (message.type() === "error" || /^\[(?:STRICT_|PRIMITIVE_|REACTIVITY_)/.test(message.text())) {
            errors.push(message.text());
        }
    });
    await context.route(/\/v2\//, route => route.fulfill({ json: { total: 0, comments: [], items: [], count: 0, interacted: false } }));
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    for (const pathname of ["/", "/archives/", "/404/", "/life/"]) {
        await page.goto(pathname);
        await expect(page.locator("main")).toBeVisible();
        await page.getByTitle("Switch Theme").click();
        await page.getByText("深色模式", { exact: true }).click();
        await expect(page.locator("html")).toHaveClass("dark");
    }
    await page.goto("/posts/solana-vanity-prefix-vs-suffix-probability/");
    const copy = page.locator(".code-header button").first();
    await expect(copy).toBeVisible();
    await copy.click();
    await expect(copy).toContainText("已复制");
    await page.locator('header a[href="/archives/"]').click();
    await expect(page).toHaveTitle("归档 · Wincer's Blog");
    expect(errors).toEqual([]);
});
