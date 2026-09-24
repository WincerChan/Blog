# 生产构建页面网络基线（2026-09-24）

本次结果来自当前代码的本地生产构建，不是线上 CDN 测量。真实 `.env` 配置重新加载后构建成功；未使用临时密钥、模拟接口或修改应用代码。

## 环境与统计口径

- 代码提交：`744ad8ccfaca8a7c9c5809510ddb04cc16c31796`。用户在测量前更新了本地 `.env`；报告不保存密钥。
- 构建：`NODE_ENV=production`，Bun 1.3.14，Node 24.12.0，Vite 8.2.1。产物时间：2026-09-24 13:06:42（Asia/Singapore），预渲染 103 个路由。
- 依赖：solid-js 1.9.14、@solidjs/start 2.0.0、@solidjs/router 1.0.0、@solidjs/meta 0.29.4。
- 预览：serve 14.2.6，`http://127.0.0.1:4173`；文本资源实测使用 Brotli（br），并非构建日志中的 gzip 估算。
- 浏览器：Chrome 153.0.8010.49（headless），Playwright Core 1.63.0；桌面视口 1440 × 900，DPR 1。
- 每个页面使用全新浏览器上下文，禁用 HTTP 缓存和 Service Worker；从地址直接打开，无滚动、点击或搜索提交。
- load 后至少等待 5 秒，再等待 1 秒网络安静且全部请求结束；上限 20 秒。本次 18 页均无未完成请求。
- 请求数包含 HTML、JS、CSS、字体、图片、favicon 和已发起的 API 请求，包含失败请求。只统计该观察窗口内实际触发的请求。
- 传输大小为 Chrome CDP `Network.loadingFinished.encodedDataLength` 总和，包含压缩响应及可观测的协议开销，不含请求上传、DNS/TLS 等流量。资源大小为 `Network.dataReceived.dataLength` 总和（解压后的响应体）。1 KiB = 1024 bytes。
- Service Worker 脚本下载单列在后文。失败请求未获得完整传输大小，不能把其零字节记录理解为网络上完全没有流量。
- 这是每页一次采样的体积基线，不是耗时或统计性能基准。未测试滚动加载、站内跳转、热缓存、移动端、解密文章或提交搜索。

## 页面结果

下表是页面请求的实测值，不含 Service Worker 注册脚本。带失败请求的行表示加载不完整。

| 页面 | URL | 请求数 | 传输大小 KiB | 资源大小 KiB | 失败请求 |
|---|---|---:|---:|---:|---:|
| 首页 | `/` | 6 | 60.9 | 219.3 | 0 |
| 归档 | `/archives/` | 9 | 81.0 | 291.9 | 0 |
| 分类 | `/category/实验室/` | 6 | 67.5 | 244.3 | 0 |
| 搜索 | `/search/` | 9 | 76.7 | 259.5 | 0 |
| 生活 | `/life/` | 13 | 75.0 | 254.0 | 3 |
| 友链 | `/friends/` | 13 | 96.2 | 292.4 | 0 |
| 关于 | `/about/` | 8 | 74.8 | 258.9 | 0 |
| 最新文章 | `/posts/yunnan-family-trip-dali-lijiang/` | 7 | 80.0 | 281.6 | 0 |
| 技术文章 | `/posts/refactoring-blog-architecture-with-vibe-coding/` | 7 | 80.6 | 284.1 | 0 |
| 公式文章 | `/posts/solana-vanity-prefix-vs-suffix-probability/` | 10 | 134.1 | 429.0 | 0 |
| 加密文章 | `/posts/d67271d8/` | 9 | 78.2 | 262.6 | 1 |
| 404 | `/404/` | 8 | 71.5 | 246.1 | 0 |
| 英文归档 | `/archives-en/` | 9 | 81.0 | 292.1 | 0 |
| 英文搜索 | `/search-en/` | 9 | 76.6 | 259.4 | 0 |
| 英文生活 | `/life-en/` | 13 | 74.8 | 253.1 | 3 |
| 英文友链 | `/friends-en/` | 13 | 95.8 | 290.6 | 0 |
| 英文关于 | `/about-en/` | 8 | 73.4 | 253.8 | 0 |
| 英文文章 | `/posts/solana-vanity-prefix-vs-suffix-probability-en/` | 10 | 133.2 | 435.3 | 0 |

## 首次访问的 Service Worker 开销

另外在允许 Service Worker 的独立首页访问中，实际观察到了 `/sw.js?v=…` 注册下载，注册最终为 activated，首次页面没有 controller。为补齐其开销，又用独立无缓存请求测得 `/sw.js` 传输 **2377 bytes（2.3 KiB）**，解压后 **5022 bytes（4.9 KiB）**，编码 br。

新用户首次访问的预算可按每行 **再加 1 个请求、约 2.3 KiB 传输、4.9 KiB 资源** 估算。例如首页约为 **7 个请求、63.2 KiB 传输、224.2 KiB 资源**。这里的合计是页面采样与独立 SW 下载的相加估算，不是同一条浏览器记录中的完整总流量；已注册 SW 的后续访问不能直接套用。

## 观察与限制

- 首页 6 个页面请求：1 HTML、3 JS、1 CSS、1 favicon。公共 app-shared JS 约 25.0 KiB、entry-client JS 约 13.0 KiB、公共 CSS 约 11.1 KiB（均为传输大小）。
- 普通文章样本为 7 个页面请求、约 80 KiB；公式文章为 10 个请求、约 134 KiB，额外包含 KaTeX CSS 和 2 个字体请求。
- 生活和英文生活各有 3 个失败请求；加密文章有 1 个失败请求。生活页复查的浏览器控制台明确显示 CORS：生产 API 没有为 `http://127.0.0.1:4173` 返回 `Access-Control-Allow-Origin`。失败接口为 `/v2/douban/marks`、`/v2/comments`、`/v2/kudos`。这些页面缺少 API 响应及其可能触发的图片等后续资源，不能代表线上完整加载大小。
- 加密文章的失败请求是 `/v2/kudos`，CDP 记录 `net::ERR_FAILED`；未单独对该页面采集控制台来确认原因。
- 生产访问统计在 `packages/inkstone-track/src/index.ts` 的 `shouldSendPulse` 中检查站点 hostname，本地预览不会发送正式站点的 pulse 请求。线上传输总量可能更高。
- 构建成功但有内容警告：`comments-mapping count (91) does not match posts (85)`。未将其修改或隐藏。
- 初次执行 `NODE_ENV=production bun run build` 因子进程缺少密钥失败；显式加载旧 `.env` 后出现 401。用户更新 `.env` 后重新读取并构建成功。未把旧产物作为本次结果。
- 线上复核需在正式站点以同样视口、冷缓存、观察窗口再采集，以纳入 CDN 压缩、API 响应、访问统计与完整 Service Worker 流量。

## 复现

显式读取当前 `.env` 后运行用户指定的构建，避免父进程已有变量覆盖文件中的更新：

```sh
NODE_ENV=production node --input-type=module -e 'import { readFileSync } from "node:fs"; import { parseEnv } from "node:util"; import { spawn } from "node:child_process"; const env = { ...process.env, ...parseEnv(readFileSync(".env", "utf8")), NODE_ENV: "production" }; const child = spawn("bun", ["run", "build"], { env, stdio: "inherit" }); child.on("exit", code => process.exit(code ?? 1));'
```

将采集工具安装在临时目录，不改变项目依赖。以下安装与预览命令使用本次实际使用的版本；预览需保持运行，采集在另一个终端执行。

```sh
npm install --prefix /tmp/blog-network-baseline --no-audit --no-fund playwright-core@1.63.0 serve@14.2.6
/tmp/blog-network-baseline/node_modules/.bin/serve .output/public -l tcp://127.0.0.1:4173 --no-clipboard --no-request-logging --no-port-switching
```

```sh
PLAYWRIGHT_MODULE=file:///tmp/blog-network-baseline/node_modules/playwright-core/index.mjs node reports/network-baseline-2026-09-24/measure.mjs
```

采集脚本需要本机安装 Google Chrome。默认写入同目录 `rerun.json`，避免覆盖原始基线；可通过 `BASELINE_URL` 和 `BASELINE_OUTPUT` 修改地址及输出位置。脚本只复现主表的页面采集，不包含 SW 独立探测或 CORS 控制台复查。

## 文件与校验

- `requests.json`：18 页逐请求状态、类型和字节数，以及构建环境与 SW 补充数据；URL 中的 token 已脱敏。
- `cors-errors.json`：生活页独立复查的浏览器控制台错误，token 已脱敏。
- `measure.mjs`：采集脚本。
- 生产构建退出码 0；18 页文档均返回 200（`/404/` 是显式错误展示页）；无待完成请求。
- 已核对每页请求数与明细长度、两种字节总数与明细求和一致。
- 此次未修改应用代码或项目依赖，未运行应用测试套件。
