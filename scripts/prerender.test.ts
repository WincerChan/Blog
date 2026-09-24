import { afterEach, expect, test } from "bun:test";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { prerender } from "../tools/build/prerender.mjs";

const temporary: string[] = [];
afterEach(async () => { await Promise.all(temporary.splice(0).map(dir => rm(dir, { recursive: true, force: true }))); });

async function fixture(routes: string) {
    const root = await mkdtemp(path.join(os.tmpdir(), "blog-prerender-"));
    temporary.push(root);
    const publicDir = path.join(root, "public");
    const clientDir = path.join(root, "client");
    const outputDir = path.join(root, "output");
    await Promise.all([publicDir, clientDir, outputDir].map(dir => mkdir(dir)));
    await writeFile(path.join(publicDir, "valid_paths.txt"), routes);
    await writeFile(path.join(publicDir, "sw.js"), "fresh worker");
    await writeFile(path.join(clientDir, "app.js"), "client bundle");
    await writeFile(path.join(outputDir, "index.html"), "previous site");
    return { publicDir, clientDir, outputDir, baseURL: "https://example.com" };
}

test("prerenders Unicode paths and creates a static 404 without a server runtime", async () => {
    const options = await fixture("/\n/category/%E5%AE%9E%E9%AA%8C%E5%AE%A4/\n/\n");
    const requests: string[] = [];
    const count = await prerender({ ...options, render: async (request: Request) => {
        requests.push(request.url);
        return new Response(`<html><body>${new URL(request.url).pathname}</body></html>`, {
            status: request.url.endsWith("/404/") ? 404 : 200,
        });
    } });
    expect(count).toBe(3);
    expect(requests).toHaveLength(3);
    expect(await readFile(path.join(options.outputDir, "category/实验室/index.html"), "utf8")).toContain("<html>");
    expect(await readFile(path.join(options.outputDir, "404.html"), "utf8")).toContain("/404/");
    expect(await readFile(path.join(options.outputDir, "sw.js"), "utf8")).toBe("fresh worker");
    expect(await readFile(path.join(options.outputDir, "app.js"), "utf8")).toBe("client bundle");
});

test("a failed or incomplete render preserves the previous static site", async () => {
    for (const response of [new Response("failed", { status: 500 }), new Response("<html>unfinished")]) {
        const options = await fixture("/\n");
        await expect(prerender({ ...options, render: async () => response })).rejects.toThrow();
        expect(await readFile(path.join(options.outputDir, "index.html"), "utf8")).toBe("previous site");
    }
});

test("static hydration waits for document parsing without changing other scripts", async () => {
    const options = await fixture("/\n");
    await prerender({ ...options, render: async () => new Response(
        '<html><head><script type="module" nonce="test" src="/entry.js" async></script>' +
        '<script src="/analytics.js" async></script></head><body>Article</body></html>',
    ) });
    const html = await readFile(path.join(options.outputDir, "index.html"), "utf8");
    expect(html).toContain('<script type="module" nonce="test" src="/entry.js"></script>');
    expect(html).toContain('<script src="/analytics.js" async></script>');
});

test("rejects a route escaping the output directory before rendering", async () => {
    const options = await fixture("/%2e%2e%2fescape/\n");
    let calls = 0;
    await expect(prerender({ ...options, render: async () => { calls++; return new Response("<html></html>"); } })).rejects.toThrow("Invalid prerender path");
    expect(calls).toBe(0);
    expect(await readFile(path.join(options.outputDir, "index.html"), "utf8")).toBe("previous site");
});
