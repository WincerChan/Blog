# Solid 2 公共包优化（2026-09-24）

## 结果

并非所有新增代码都必需。主题只保存 light / dark 一个标量，改用 signal 后成功移除了深层 store、projection 和 reconcile 的实现。合并两个小脚本，并内联站点配置字段，进一步减少请求与脚本体积；没有修改依赖版本，也没有改写 node_modules。

以**已经修复 favicon 的 RC9**为本轮基线，同一台 Chrome、本地生产预览、同样冷缓存条件下：

| 首页指标 | 优化前 | 优化后 |
|---|---:|---:|
| 页面请求 | 8 | 6 |
| 全页传输 | 90.5 KiB | 80.3 KiB |
| 所有 JS 传输合计 | 70.9 KiB | 60.7 KiB |
| app-shared 传输 | 53.8 KiB | 46.5 KiB |
| app-shared 解压后响应体 | 160.0 KiB | 123.8 KiB |

全页减少 **10.2 KiB（11.3%）**，移除 **2 个请求**。所有首页 JS 合计也下降，收益不是把代码移到另一个文件。这里的 app-shared 优化后已经包含原先独立的 utils / events。

Solid 1 的首页基线是 60.9 KiB；初次迁移 RC9 是 93.7 KiB；favicon 修复后 90.5 KiB；本轮最终 80.3 KiB。相比 Solid 1，仍增加 19.4 KiB，不能宣称已恢复旧版体积。

## 做了什么

- `src/features/theme/provider.tsx`：以 `createSignal<ThemeValue>` 代替 `createStore`，调用方使用 theme / setTheme。原 store 只有 theme 一个字段，不需要深层代理、draft、reconcile 或 projection。
- `vite.config.ts`：将 `src/utils/index.tsx` 与 Router `data/events.js` 纳入现有公共分包。保留事件逻辑与站内导航，减少两个小请求。
- `vite.config.ts`：对 `__SITE_CONF` 的各字段设置构建常量，避免每次属性读取都嵌入整份站点配置对象；保留整个对象的定义供整体读取。
- `tools/build/prerender.mjs`：移除插件生成的外部 module 入口上的 async，让静态 HTML 解析结束后再水合。详见下文的回归调查。
- 浏览器回归新增系统主题切换、手动主题覆盖检查，并捕获框架边界记录到 console.error 的异常；单测验证静态入口延后执行且不影响普通 async 脚本。

## 对照实验

实验用 Vite 的 write:false 客户端构建，不改项目源文件；选取入口、首页路由及其递归静态依赖，计算合计而不只观察 app-shared。仅 signal 实验通过临时兼容封装维持旧调用接口，最终实现直接使用 signal。

下面的 Brotli 是 Node 默认 quality 11 的独立压缩估算，**不含 HTTP 开销，也不是上方 serve 实测的传输值**。不得将它直接从实测传输列相减。模块 renderedLength 是最终 chunk 压缩前的统计，不能相加当作网络大小。

| 方案 | 首页 JS 请求数 | JS 原始 KiB | Brotli 估算 KiB |
|---|---:|---:|---:|
| 优化前 | 5 | 204.2 | 59.0 |
| 仅主题改为 signal | 5 | 178.7 | 52.0 |
| 取消手动分包 | 12 | 205.9 | 62.0 |
| 仅合并 utils / events | 3 | 204.1 | 58.7 |
| 按入口分组 | 13 | 208.1 | 62.7 |
| 仅内联配置字段 | 5 | 188.5 | 58.5 |
| 三项组合（实验兼容封装） | 3 | 162.9 | 51.1 |
| 最终实现 | 3 | 162.8 | 51.0 |

取消手动分包或按入口分组都会显著增加首页 JS 请求，压缩后的合计也更大，因此没有采用。主题改用 signal 是主要收益；配置字段内联主要减少解析前的代码量，传输收益较小。

`bundle-experiments.json` 保留各方案的模块归属和大小。最终 app-shared 已无 `@solidjs/signals/dist/prod/store/next/*`，也没有独立的 createStore 实现；未包含 dev / observe 模块。

## 为什么还保留部分代码

- `store/utils.js` 不是深层 store 本体：`@solidjs/web/dist/web.js` 从 `solid-js/internal` 使用 sourceGet、sourceKeys、viewOf 等处理 JSX 的属性来源，meta 也使用 merge / omit。删掉这部分会改变属性合并和响应性。
- `core/optimistic.js` 是 Router 的间接依赖：`@solidjs/router/dist/routing.js` 的 createRouterContext 使用 isPending / latest 跟踪导航，`core/verdict.js` 的 pending/latest 状态维护安装 optimistic engine。即便业务没有调用 createOptimistic，现有 Router 的导航状态仍需要这条依赖。
- DOM 渲染、水合、异步 memo、Loading、列表和响应式调度仍由当前页面使用。静态生成移除线上服务端，并不会自动省去客户端运行时。

这说明哪些路径在**当前 RC9 与 Router 组合下**仍被依赖，不是声称它们在所有实现中都无法精简。进一步替换路由/水合机制或删减交互属于架构与行为变化，本轮没有用这些方式制造体积下降。

## 水合时序回归调查

优化后完整测试捕获过 `TypeError: Cannot read properties of null (reading 'nextSibling')`。同一路径重复 5 次有 2 次失败；取消小包合并仍有 1/5 失败，恢复 store 仍有 2/5 失败，因此不能把它简单归因于某一项优化。

trace 显示错误发生在文章文档导航期间、点击英文链接之前。`@solidjs/vite-plugin/dist/esm/index.mjs` 的 createHtmlChunkTransform 给 SSR 入口注入 `<script type="module" src="…" async>`，位于 head 内。缓存命中时它可能在较长文章的 body 解析完成前执行，框架编译出的水合代码便读取到不完整的 DOM。

静态生成现在将这个入口改为普通 module 脚本，使用浏览器默认的延后执行行为。未更改流式服务端或依赖代码。修复后全量浏览器回归通过，该导航路径额外重复 10 次全部通过；103 个静态页面均检查到一个不带 async 的 module 入口。

## 页面复测

以下三列依次是 **Solid 1 / 初次迁移 RC9（favicon 尚未修复）/ 本轮最终结果**。本轮只有首页单独保留了 favicon 修复后的优化前采样，其他页面不将 favicon 的收益误算为本轮独有收益。

| 页面 | 路径 | 请求数（1 / RC9 / 最终） | 传输 KiB（1 / RC9 / 最终） | 最终失败请求 |
|---|---|---:|---:|---:|
| 首页 | `/` | 6 / 8 / 6 | 60.9 / 93.7 / 80.3 | 0 |
| 归档 | `/archives/` | 9 / 11 / 9 | 81.0 / 113.9 / 100.5 | 0 |
| 分类 | `/category/实验室/` | 6 / 8 / 6 | 67.5 / 100.2 / 86.8 | 0 |
| 搜索 | `/search/` | 9 / 11 / 9 | 76.7 / 109.8 / 96.4 | 0 |
| 生活 | `/life/` | 13 / 15 / 13 | 75.0 / 108.0 / 94.7 | 3 |
| 友链 | `/friends/` | 13 / 15 / 13 | 96.2 / 129.2 / 115.8 | 0 |
| 关于 | `/about/` | 8 / 10 / 8 | 74.8 / 107.8 / 94.5 | 0 |
| 最新文章 | `/posts/yunnan-family-trip-dali-lijiang/` | 7 / 9 / 7 | 80.0 / 113.1 / 99.7 | 0 |
| 技术文章 | `/posts/refactoring-blog-architecture-with-vibe-coding/` | 7 / 9 / 7 | 80.6 / 113.5 / 100.1 | 0 |
| 公式文章 | `/posts/solana-vanity-prefix-vs-suffix-probability/` | 10 / 12 / 10 | 134.1 / 167.1 / 153.7 | 0 |
| 加密文章 | `/posts/d67271d8/` | 9 / 11 / 9 | 78.2 / 110.9 / 97.5 | 1 |
| 404 | `/404/` | 8 / 10 / 8 | 71.5 / 104.4 / 91.1 | 0 |
| 英文归档 | `/archives-en/` | 9 / 11 / 9 | 81.0 / 113.8 / 100.5 | 0 |
| 英文搜索 | `/search-en/` | 9 / 11 / 9 | 76.6 / 109.6 / 96.3 | 0 |
| 英文生活 | `/life-en/` | 13 / 15 / 13 | 74.8 / 107.8 / 94.4 | 3 |
| 英文友链 | `/friends-en/` | 13 / 15 / 13 | 95.8 / 128.7 / 115.4 | 0 |
| 英文关于 | `/about-en/` | 8 / 10 / 8 | 73.4 / 106.3 / 92.9 | 0 |
| 英文文章 | `/posts/solana-vanity-prefix-vs-suffix-probability-en/` | 10 / 12 / 10 | 133.2 / 166.3 / 152.9 | 0 |

采样开始时间 2026-09-24T11:58:14.178Z，Chrome 153.0.8010.49，serve 14.2.6，1440 × 900、DPR 1。每页独立冷缓存上下文，禁用 SW，无滚动和点击；load 后至少 5 秒再等待 1 秒网络安静，上限 20 秒。复用 [原始采集脚本](../network-baseline-2026-09-24/measure.mjs)，所有请求数和字节求和已核对，token 参数已脱敏。

传输值为 CDP loadingFinished.encodedDataLength，资源值为 dataReceived.dataLength。每页单次采样，不是延迟基准。Service Worker 下载未计入。生活 / 英文生活各有 3 个失败请求，加密文章有 1 个，与先前本地 API 限制一致；失败响应及后续资源不完整，不能视为线上完整流量。正式域名 pulse 统计在本地不会发送。18 页均无 pending。

## 验证

- `NODE_ENV=production bun run build`：PASS，103 路由。
- `bun test`：PASS，71 测试、170 断言。
- `bun run test:e2e`：PASS，11 项。
- `bun run test:e2e --project=static --grep 'hydrates and navigates' --repeat-each=10`：PASS，10 次。
- 103 页静态 module 执行属性、两个 favicon 和 JSON-LD：PASS。
- `bunx tsc --noEmit --skipLibCheck`：仍 FAIL，既有类型债务；相对迁移后日志，没有新增 src 文件/错误码组合。
- 开发模式仍有既有 ASYNC_WATERFALL 提示；生产内容仍有 comments-mapping 数量警告。

## 复现最终网络采集

先运行生产构建，再在一个终端保持预览服务运行：

```sh
NODE_ENV=production bun run build
bun run preview --listen tcp://127.0.0.1:4173 --no-clipboard --no-request-logging --no-port-switching
```

另一个终端（需要本机 Google Chrome）：

```sh
PLAYWRIGHT_MODULE=@playwright/test BASELINE_OUTPUT=reports/solid2-bundle-optimization-2026-09-24/rerun.json node reports/network-baseline-2026-09-24/measure.mjs
```

实际采集使用同版本的 `/tmp/blog-network-baseline/node_modules/playwright-core/index.mjs`。`requests.json` 是最终 18 页明细，`before-home.json` 是 favicon 修复后的优化前首页；旧报告原样保留。
