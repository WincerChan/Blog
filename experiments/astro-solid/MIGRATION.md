> 2026-10-13：内容管线已进一步迁移到 Astro Content Layer，移除了 Velite。当前内容架构与验证见 [Astro Content Layer migration](../astro-content/MIGRATION.md)；下文保留框架迁移阶段的测量记录。

# 全站 Astro + Solid 迁移

分支：`codex/astro-solid-experiment`。未提交、未推送、未部署。

## 当前结构

- 默认 `NODE_ENV=production bun run build`：Velite → `.velite/astro-data` → Astro 静态 HTML，输出 `dist/astro`。
- `bun run dev`：3001 端口；Velite watch 与 Astro HMR 联动。
- `bun run preview`：4176 端口。
- 首页、85 篇文章、其余内容页/分类及 404 共 103 个页面已生成；没有指向线上旧站的占位跳转。
- `src/astro/pages` 为路由，`src/astro/layouts/Site.astro` 管理文档、SEO、导航与页脚。
- Markdown/Shiki/KaTeX、taxonomy/stats、OG、Atom/sitemap、搜索索引、加密继续由 Velite 生成。内容没有迁到 Astro content collections。
- `manifest.json` 为有效内容清单；开发 watch 删除或改为 draft 时不会继续从残留 JSON 生成路由。
- 浏览器通过 Astro ClientRouter 获取目标 HTML 并替换页面；Solid islands 负责交互。页面 URL、站内后退、语言切换与主题保持已验证。

## 恢复的外观和功能

直接复用原页头、菜单、主题选择器、页脚、首页卡片、文章元信息、代码操作、前后篇、关联文章及版权组件。静态组件只在构建期渲染；没有将整页重新水合。

已恢复归档、分类、友链、生活 API、搜索（语法 token、查询 URL、排序、分页、清空、历史后退）、返回顶部、PWA 更新提示。搜索页保持原版不显示点赞/分享/评论。

SEO 包括 canonical、hreflang、OG/Twitter、JSON-LD、本地 logo、应用元数据和 favicon。加密文章继续只把密文发送到浏览器，保留密码框样式与错误状态。

SW 改为缓存 `/_astro/` 脚本/样式和页面 HTML/搜索索引，保留版本更新提示及旧缓存清理。`build.sh` 的打包路径及 npm 镜像资产路径已适配 `_astro`，未执行发布。

已移除 SolidStart/Router/Meta/Nitro 依赖与旧路由/layout/entry、`velite.server.ts` / `velite.client.ts`、客户端 JSON 读取、旧 Vite 配置及手动分包。最终产物无 `/_data`；stats 不作为 define 注入客户端。

## 视觉对照

原 Solid 1 生产产物与 Astro 在同一 Chrome 中对照。8 类页面（首页、归档、分类、搜索、友链、生活、关于、公式文章）× 1440/375px，共 16 组：

- 正文可见文案一致。
- 标题和页脚的 bounding box 一致。
- 无横向溢出，无浏览器 JS 错误。
- 页头页脚复用原组件；已查看截图。

结果：[full-visual.json](./full-visual.json)。截图位于本机 `/tmp/blog-astro-full-visual`。这是指定场景的布局/文案对照，不是所有像素、所有浏览器的穷举证明。

## 验证

- `NODE_ENV=production bun run build`：PASS，103 页面。
- `bun test`：PASS，69 tests / 166 assertions。
- `node tools/velite/crypto-gcm.test.cjs`：PASS（也被 bun test 执行）。
- `node tools/astro/check-output.mjs`：PASS，102 内容路由 + 404、静态资源/SW、无 SPA JSON、加密正文隔离。
- `tools/astro/browser-check.mjs`：PASS，10 组评论/密码/主题/目录/导航/模拟点赞。
- `tools/astro/full-browser-check.mjs`：PASS，搜索 URL/分页/排序/清空/历史、生活 API、移动菜单/滚动解锁、英文 SEO/语言切换、返回顶部、SW 实际激活/离线首页/更新提示/刷新。
- `tools/astro/compare-visual.mjs`：16 组对照通过。
- 开发模式临时 Markdown 页的新增/编辑/删除验证通过，测试文件已清理。
- `bash -n build.sh`、`git diff --check`：PASS。
- `bunx tsc --noEmit`：FAIL。未完成仓库类型债务清理，包括缺少 `bun:test` 类型、旧组件的隐式 any、翻译函数类型和 WebCrypto 参数类型等；详见 [typecheck.log](./typecheck.log)。生产构建及上述浏览器检查通过不能替代完整类型检查。

动态 API 使用模拟响应验证，未执行线上点赞或统计写入；生产构建读取真实 comments mapping。未部署，未执行 npm publish。

## 完整功能版的网络测量

原始结果：[full-measurement.json](./full-measurement.json)。同一个 Brotli Q11 服务器，Chrome 1440×900，SW 不可用，API 模拟；只汇总本站资源。冷启动禁用 cache，站内导航启用 cache。字节包含 HTTP 响应头。

| JS 传输量 | Solid 1 | Solid 2 | 完整 Astro |
|---|---:|---:|---:|
| 首页首屏 | 34.20 KiB / 3 请求 | 51.44 KiB / 3 请求 | 29.34 KiB / 13 请求 |
| 公式文章首屏 | 43.49 KiB / 4 请求 | 60.77 KiB / 4 请求 | 31.27 KiB / 14 请求 |
| 公式文章完整交互累计 | 43.49 KiB / 4 请求 | 60.77 KiB / 4 请求 | 37.59 KiB / 16 请求 |
| 首页 → 第一篇文章新增 JS | 10.82 KiB / 2 请求 | 10.86 KiB / 2 请求 | 1.93 KiB / 1 请求 |

完整文章交互 JS 相比 Solid 1 少约 13.6%，相比 Solid 2 少约 38.2%。不能继续使用第一阶段简化页头/页脚时的 29% / 49% 节省数字。

本站全部资源：Astro 首页 46.40 KiB / 16 请求；公式文章首屏 104.89 KiB / 20 请求；滚动后累计 111.20 KiB / 22 请求。首页 → 第一篇文章新增总流量 17.21 KiB，原 Solid 1 为 16.76 KiB：JS 更少，但 HTML 导航总流量不一定更少。

此阶段优先保证完整功能与原版外观，没有加入手动 chunk 合并策略。独立 islands 和共享依赖导致 JS 请求数量较多，合包是后续可以单独验证的优化。

复现测量需运行同样的 `tools/astro/serve-measurement.mjs`，Solid 1/2 分别用 4177/4178，Astro 默认 4176（可通过 `ASTRO_MEASURE_PORT` 指定）。浏览器脚本使用已有 Playwright 或 `PLAYWRIGHT_MODULE` 指定模块路径。
