import { cp, mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const prerender = async ({ publicDir, clientDir, outputDir, baseURL, render }) => {
    const routes = new Set([
        ...(await readFile(path.join(publicDir, "valid_paths.txt"), "utf8")).trim().split(/\r?\n/).filter(Boolean),
        "/404/",
    ]);
    const origin = new URL(baseURL).origin;
    const staging = `${outputDir}.staging`;
    const destinations = [...routes].map(route => {
        const url = new URL(route, baseURL);
        const directory = path.resolve(staging, `.${decodeURIComponent(url.pathname)}`);
        if (!route.startsWith("/") || url.origin !== origin || url.search || url.hash ||
            (directory !== staging && !directory.startsWith(`${staging}${path.sep}`))) {
            throw new Error(`Invalid prerender path: ${route}`);
        }
        return { route, url, directory };
    });

    await rm(staging, { recursive: true, force: true });
    try {
        await cp(clientDir, staging, { recursive: true });
        // The worker build may finish after Vite has copied public assets.
        await cp(path.join(publicDir, "sw.js"), path.join(staging, "sw.js"));
        for (const { route, url, directory } of destinations) {
            const response = await render(new Request(url, { headers: { Accept: "text/html" } }));
            if (!response.ok && !(route === "/404/" && response.status === 404)) {
                throw new Error(`Prerender failed: ${route} (${response.status})`);
            }
            // The plugin's streaming entry is async. A cached entry can hydrate a
            // static document before its body finishes parsing; module scripts
            // without async wait for the complete document instead.
            const html = (await response.text()).replace(
                /(<script type="module"(?: nonce="[^"]*")? src="[^"]+") async><\/script>/g,
                "$1></script>",
            );
            if (!html.includes("</html>")) throw new Error(`Incomplete document: ${route}`);
            await mkdir(directory, { recursive: true });
            await writeFile(path.join(directory, "index.html"), html);
        }
        await cp(path.join(staging, "404/index.html"), path.join(staging, "404.html"));
        // Keep the previous static site available until every route has rendered successfully.
        await rm(outputDir, { recursive: true, force: true });
        await rename(staging, outputDir);
    } finally {
        await rm(staging, { recursive: true, force: true });
    }
    return routes.size;
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const root = fileURLToPath(new URL("../../", import.meta.url));
    const { configureServerErrors } = await import("@solidjs/web");
    const { handleRequest } = await import(path.join(root, "dist/server/server.js"));
    const site = JSON.parse(await readFile(path.join(root, "site.config.json"), "utf8"));
    let renderError;
    configureServerErrors({ onError(error) { renderError ??= error; } });
    const count = await prerender({
        publicDir: path.join(root, "public"),
        clientDir: path.join(root, "dist/client"),
        outputDir: path.join(root, ".output/public"),
        baseURL: site.baseURL,
        async render(request) {
            renderError = undefined;
            const response = await handleRequest(request, { renderMode: "async" });
            if (renderError) throw new Error(`Render failed: ${new URL(request.url).pathname}`, { cause: renderError });
            return response;
        },
    });
    console.log(`Prerendered ${count} routes to .output/public`);
}
