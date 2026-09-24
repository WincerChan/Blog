# Solid 2 RC9 迁移与加载量对比（2026-09-24）

## 迁移结果

基于提交 `744ad8ccfaca8a7c9c5809510ddb04cc16c31796` 的工作区迁移，未提交。依照 [SolidStart 迁移指南](https://v2.solidjs.com/migration/from-solid-start) 和 [RC9 发布说明](https://github.com/solidjs/solid/releases/tag/solid-js%402.0.0-rc.9)。

| 依赖 | 迁移前 | 迁移后 |
|---|---|---|
| solid-js | 1.9.14 | 2.0.0-rc.9 |
| @solidjs/web | 未独立安装 | 2.0.0-rc.9 |
| @solidjs/router | 1.0.0 | 2.0.0-next.27 |
| @solidjs/meta | 0.29.4 | 1.0.0-next.2 |
| @solidjs/start | 2.0.0 | 移除 |
| @solidjs/vite-plugin | 间接依赖 | 3.0.0-next.44 |
| filesystem-routing | 未安装 | 0.3.1 |
| nitro | 使用静态预设 | 移除 |

- 使用插件自动入口、Document 和文件路由；迁移响应式副作用、异步 memo、Loading / Errored、store 和 head API。
- 保留 typesafe-i18n 字典，提供 Solid 2 context 适配器并避免生成器覆盖。
- Vite 生成 client / server 中间产物，专用预渲染脚本输出 103 个静态路由，部署目录仍为 `.output/public`。预渲染失败时保留之前的静态站点。
- 内容构建通过 Node 显式加载 `.env`；此次生产构建使用真实本地配置，未使用临时密钥。
- 新增 Playwright 与 serve 开发依赖，用于验证水合、导航与静态部署行为。

## 验证

| 检查 | 结果 |
|---|---|
| `NODE_ENV=production bun run build` | PASS，103 路由 |
| `bun test` | PASS，70 测试、168 断言 |
| `bun run test:e2e` | PASS，8 项静态站点 + 1 项开发模式 |
| `bun run i18n --no-watch` | PASS，手写适配器未被覆盖 |
| 静态产物与旧版比较 | 103 页路由、title、html lang 一致；JSON-LD 可解析、charset 唯一 |
| 构建密钥检查 | 244 个公开 HTML/JS/JSON/CSS 文件未发现本地构建密钥 |
| `bunx tsc --noEmit --skipLibCheck` | FAIL，仍有既有类型问题，见下文 |

浏览器回归覆盖水合、SPA 导航、中英文切换、head 去重、主题持久化、移动菜单滚动解锁、搜索分页排序与错误恢复、代码复制、评论延迟加载、点赞、生活页、错误解密密码、无 JS 文章和公式 CSS、404。行为测试中的外部 API 使用 mock，不写入真实点赞或访问统计。

类型检查在迁移前已经失败，包括 `bun:test` 类型缺失、`src/content/velite.ts` 联合类型收窄以及组件隐式 any。以 src 文件和错误码比较，原 78 条降至 27 条，无新增文件/错误码组合；这不等于整个类型检查通过。新的预渲染测试同样受项目缺少 `bun:test` 类型声明影响。

开发服务器有 `ASYNC_WATERFALL` 提示（懒路由与数据产生 3 次串行异步等待，采样 13–20ms），不是测试失败。生产构建仍有既有内容警告：`comments-mapping count (91) does not match posts (85)`。

## 网络测量口径

使用[原始基线](../network-baseline-2026-09-24/report.md)的同一采集脚本、serve 14.2.6、Chrome 153.0.8010.49、1440 × 900 桌面视口、DPR 1、本地 `http://127.0.0.1:4173`。采样开始于 2026-09-24T05:46:54.420Z。

每页独立冷缓存上下文，禁用 Service Worker，不滚动或交互；load 后至少等待 5 秒，再等待 1 秒网络安静，上限 20 秒。请求数包括失败请求。传输大小为 CDP `loadingFinished.encodedDataLength` 总和，资源大小为解压后的 `dataReceived.dataLength` 总和；文本资源使用 Brotli，1 KiB = 1024 bytes。每页一次采样，不是速度基准，也不是线上 CDN 测量。

18 页均增加 **2 个请求**，传输增加 **32.7–33.1 KiB**。首页从 **60.9 KiB 增至 93.7 KiB**，公式文章从 **134.1 KiB 增至 167.1 KiB**。此次迁移没有带来首屏加载量下降。

| 页面 | URL | 请求数（前 → 后） | 传输 KiB（前 → 后） | 增量 KiB | 迁移后资源 KiB | 失败数 |
|---|---|---:|---:|---:|---:|---:|
| 首页 | `/` | 6 → 8 | 60.9 → 93.7 | +32.8 | 299.8 | 0 |
| 归档 | `/archives/` | 9 → 11 | 81.0 → 113.9 | +32.8 | 371.7 | 0 |
| 分类 | `/category/实验室/` | 6 → 8 | 67.5 → 100.2 | +32.8 | 324.2 | 0 |
| 搜索 | `/search/` | 9 → 11 | 76.7 → 109.8 | +33.0 | 340.5 | 0 |
| 生活 | `/life/` | 13 → 15 | 75.0 → 108.0 | +33.0 | 334.5 | 3 |
| 友链 | `/friends/` | 13 → 15 | 96.2 → 129.2 | +33.0 | 372.5 | 0 |
| 关于 | `/about/` | 8 → 10 | 74.8 → 107.8 | +33.0 | 339.7 | 0 |
| 最新文章 | `/posts/yunnan-family-trip-dali-lijiang/` | 7 → 9 | 80.0 → 113.1 | +33.1 | 362.2 | 0 |
| 技术文章 | `/posts/refactoring-blog-architecture-with-vibe-coding/` | 7 → 9 | 80.6 → 113.5 | +32.8 | 364.7 | 0 |
| 公式文章 | `/posts/solana-vanity-prefix-vs-suffix-probability/` | 10 → 12 | 134.1 → 167.1 | +33.0 | 509.6 | 0 |
| 加密文章 | `/posts/d67271d8/` | 9 → 11 | 78.2 → 110.9 | +32.7 | 342.1 | 1 |
| 404 | `/404/` | 8 → 10 | 71.5 → 104.4 | +33.0 | 326.9 | 0 |
| 英文归档 | `/archives-en/` | 9 → 11 | 81.0 → 113.8 | +32.9 | 371.8 | 0 |
| 英文搜索 | `/search-en/` | 9 → 11 | 76.6 → 109.6 | +33.1 | 340.5 | 0 |
| 英文生活 | `/life-en/` | 13 → 15 | 74.8 → 107.8 | +32.9 | 333.6 | 3 |
| 英文友链 | `/friends-en/` | 13 → 15 | 95.8 → 128.7 | +32.9 | 370.7 | 0 |
| 英文关于 | `/about-en/` | 8 → 10 | 73.4 → 106.3 | +32.9 | 334.5 | 0 |
| 英文文章 | `/posts/solana-vanity-prefix-vs-suffix-probability-en/` | 10 → 12 | 133.2 → 166.3 | +33.1 | 516.0 | 0 |

生活、英文生活各有 3 个失败请求，加密文章有 1 个；对应生产 API 的 `net::ERR_FAILED`，与旧版本地预览相同。旧版已确认生活接口存在本地来源 CORS 限制，本次未另采控制台确认原因。这些行缺少成功 API 响应及其可能触发的图片等资源，不能视为完整线上加载量。访问统计会检查正式 hostname，本地预览不发送正式 pulse 请求。

表格不含 Service Worker 注册下载，本次未重新测量其独立开销。所有 18 页无 pending 或 HTTP 错误状态；失败请求没有完整传输计数。`requests.json` 保留逐请求明细，token 参数已脱敏，请求数和字节总数已核对。

## 复现

先生产构建，再保持静态预览运行：

```sh
NODE_ENV=production bun run build
bun run preview --listen tcp://127.0.0.1:4173 --no-clipboard --no-request-logging --no-port-switching
```

另一个终端执行（Google Chrome 必需；项目的 Playwright 依赖已提供采集工具）：

```sh
PLAYWRIGHT_MODULE=@playwright/test BASELINE_OUTPUT=reports/solid2-migration-2026-09-24/rerun.json node reports/network-baseline-2026-09-24/measure.mjs
```

本次实际采集使用同版本的临时安装：`PLAYWRIGHT_MODULE=file:///tmp/blog-network-baseline/node_modules/playwright-core/index.mjs BASELINE_OUTPUT=/tmp/solid2-migration/network.json node reports/network-baseline-2026-09-24/measure.mjs`，随后将数据复制为本目录 `requests.json`。
