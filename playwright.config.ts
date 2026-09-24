import { defineConfig } from "@playwright/test";

export default defineConfig({
    testDir: "./tests/browser",
    projects: [
        { name: "static", testMatch: "**/migration.e2e.ts" },
        { name: "development", testMatch: "**/development.e2e.ts", use: { baseURL: "http://127.0.0.1:5174" } },
    ],
    fullyParallel: false,
    workers: 1,
    use: {
        baseURL: "http://127.0.0.1:4174",
        channel: "chrome",
        viewport: { width: 1440, height: 900 },
        trace: "retain-on-failure",
    },
    webServer: [{
        command: "bun run preview --listen tcp://127.0.0.1:4174 --no-clipboard --no-request-logging --no-port-switching",
        url: "http://127.0.0.1:4174",
        reuseExistingServer: false,
    }, {
        command: "bun run dev --host 127.0.0.1 --port 5174 --strictPort",
        // Start mode renders pages only for HTML requests; the readiness probe sends */*.
        url: "http://127.0.0.1:5174/@vite/client",
        reuseExistingServer: false,
    }],
});
