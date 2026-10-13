> 此文件保留第一阶段试验结果。当前已完成全站迁移；最新范围、验证和体积见 [MIGRATION.md](./MIGRATION.md)。下文旧入口和未迁移页面说明不再代表当前代码。

# Astro + Solid 首页/文章页试验

分支：`codex/astro-solid-experiment`。这是可运行的范围试验，不是整站替换。

## 运行

```sh
bun install
NODE_ENV=production bun run astro:build
bun run astro:preview
# http://localhost:4176

# 开发预览（先重新生成 Velite 内容）
bun run astro:dev
# http://localhost:3001
```

内容构建显式从本机 `.env` 读取配置。不要提交密钥。开发时修改 Markdown 后需重新运行 `astro:dev`；目前只对 Astro/TSX/CSS 提供框架自身的 HMR，没有额外实现 Velite watch 集成。

原来的 `bun run build` / `bun run dev` 仍走 SolidStart，用于对照。两种构建共享 `.velite`，切换时必须重新执行对应构建，不能并行运行内容生成。

## 架构与范围

- Astro 7.3.5 + `@astrojs/solid-js` 7.0.2 + Solid 1.9.14。
- 首页和全部 85 篇文章由 Astro 静态生成，正文不水合。
- 原有首页卡片、文章元数据、版权、关联文章、前后篇组件只在构建时执行。
- ToC、主题：`client:load`；评论、点赞/分享：`client:visible`；加密文章密码框：`client:load`。
- `ClientRouter` 提供页面 HTML 获取/替换、历史导航；主题 island 持久保留。站内导航没有整页 reload，但传输的是目标页面 HTML，不是原先的文章 JSON。这是不同的更新模型。
- 代码块复制、统计上报接在 `astro:page-load`；切页时释放代码块组件。测试中模拟 API，不向线上提交点赞或统计。
- 保留浅色/深色/跟随系统、移动目录、评论降级链接、密码输入样式。
- 页头和页脚使用静态 Astro 模板，保留导航和 stats；并非整站逐像素复刻。归档、搜索、分类、友链等尚未迁移，相应静态 redirect 指向现有线上站点。
- PWA/SW、返回顶部等外围能力尚未接入。不应把此输出直接部署到正式域名（未迁移路由会重定向回同一正式 URL）。

## Velite 如何处理

Markdown/Shiki/KaTeX、taxonomy/stats、OG、Atom、sitemap、搜索、AES-GCM 加密继续由现有管线生成，不迁移到 Astro content collections。

`emitPublicData` 增加可选 `dataDir`。试验构建通过 `ASTRO_EXPERIMENT=1` 写入 `.velite/astro-data`；Astro 的构建模块直接读取这份经过加密、去除密码、补齐 token/关联文章的产物。不能直接拿原始 `.velite/posts.json` 渲染文章，因为里面保留了加密前内容和构建所需密码。

静态资源复制到独立 `.astro-public`，排除旧 `/_data` 和 SW；最终 `dist/astro` 不含每篇文章的 SPA JSON。搜索索引、OG、feed、sitemap 仍保留。Stats 在 Astro frontmatter 中读取，未注入客户端。

Astro 构建不使用 `velite.server.ts` / `velite.client.ts` / `veliteClientBoundary`、Nitro、`static-entry.ts` 或手动分包规则。由于这是并存的试验入口，这些旧文件/依赖没有全仓删除；完成其余路由后才有理由清理旧入口。

## 同条件网络对比

测量日期：2026-09-27。原始数据：[measurement.json](./measurement.json)。

- Chrome，1440 × 900；三个生产输出使用同一个本地服务器和 Brotli Q11。
- 冷启动使用新 context 并关闭 HTTP cache；站内导航复用 context 且开启缓存。
- 禁用 SW，模拟动态 API；仅汇总本站静态资源。没有通过 Playwright route 拦截来测缓存（route 会禁用浏览器缓存）。
- JS 数据为 CDP 实际传输字节，含响应头；不是源码大小或纯压缩文件大小。
- 文章统一为 `/posts/solana-vanity-prefix-vs-suffix-probability/`，包含公式。滚动后累计量包含评论、点赞、分享 islands。
- Solid 1 使用本次迁移前生产输出（master 744ad8c + 评论/密码框修复）；Solid 2 使用既有 RC9 迁移快照重新生产构建。Solid 2 对照使用同一批 public 内容数据。
- 本次压缩配置与历史网络测量不完全相同，所以不能把本表与之前的 19 KiB 增量直接相减。

| 场景 | Solid 1 JS | Solid 2 JS | Astro + Solid JS |
|---|---:|---:|---:|
| 首页冷启动 | 34.20 KiB / 3 请求 | 51.44 KiB / 3 请求 | 20.98 KiB / 7 请求 |
| 公式文章首屏 | 43.49 KiB / 4 请求 | 60.77 KiB / 4 请求 | 24.54 KiB / 9 请求 |
| 公式文章滚动后累计 | 43.49 KiB / 4 请求 | 60.77 KiB / 4 请求 | 30.85 KiB / 11 请求 |
| 首页 → 第一篇文章，新增 JS | 10.82 KiB / 2 请求 | 10.86 KiB / 2 请求 | 3.56 KiB / 2 请求 |

| 场景（本站全部资源，含 HTML/CSS/字体等） | Solid 1 | Solid 2 | Astro + Solid |
|---|---:|---:|---:|
| 首页冷启动 | 51.59 KiB / 6 请求 | 67.54 KiB / 6 请求 | 33.71 KiB / 10 请求 |
| 公式文章首屏 | 119.38 KiB / 10 请求 | 135.42 KiB / 10 请求 | 93.84 KiB / 15 请求 |
| 公式文章滚动后累计 | 119.38 KiB / 10 请求 | 135.42 KiB / 10 请求 | 100.15 KiB / 17 请求 |
| 首页 → 第一篇文章，新增流量 | 16.76 KiB / 4 请求 | 16.80 KiB / 4 请求 | 15.50 KiB / 5 请求 |

三者站内导航都验证了原 window 标记仍存在，确认不是完整 reload。导航目标统一为首页第一篇 `/posts/yunnan-family-trip-dali-lijiang/`；不可将这一行当作上面公式文章的热启动结果。

结论：在本试验范围内，完整交互激活后的文章 JS 比 Solid 1 少约 **29%**，比 Solid 2 少约 **49%**。不仅是把下载延迟到滚动后。代价是独立 island/chunk 请求更多；站内跳转总流量仅小幅下降，因为要获取页面 HTML。不是全站功能等价或真实 CDN 延迟的最终结论。

## 验证与复现

已通过：

- `NODE_ENV=production bun run astro:build`：首页 + 85 篇文章，另外生成未迁移路由的跳转页。
- `bun test scripts/velite-public-data.test.ts scripts/velite-prepare.test.ts scripts/velite-search-index.test.ts`：7 tests，31 assertions。
- `node tools/velite/crypto-gcm.test.cjs`。
- `tools/astro/browser-check.mjs`：10 组；legacy/空评论/API失败/无讨论地址，light/dark × 桌面/手机的空/错/正确密码，桌面/手机主题/目录/站内跳转/后退/模拟点赞。
- 输出检查：无 `_data`/旧 SW；保留搜索/OG/feed/sitemap；加密文章 HTML 无原始正文和 `encrypt_pwd`。
- `git diff --check`。

浏览器脚本使用已安装的 Playwright，或用 `PLAYWRIGHT_MODULE=/absolute/path/to/playwright-core/index.mjs` 指定模块，不增加生产依赖。先运行对应服务器：

```sh
node tools/astro/serve-measurement.mjs dist/astro 4176
node tools/astro/serve-measurement.mjs /path/to/solid1/.output/public 4177
node tools/astro/serve-measurement.mjs /path/to/solid2/.output/public 4178
node tools/astro/measure.mjs
node tools/astro/browser-check.mjs
```

测试生成合成加密内容及模拟 API 响应，不使用真实文章密码，不写线上数据。早期浏览器脚本等待了 `display: contents` island 的可见性以及尚未进入视口的点赞岛而超时；现已改为滚动到目标并等待水合完成。测量服务器按文件修改时间更新压缩缓存，避免重建后旧 HTML 引用已删除的 hash 资源。

未做：归档/搜索等剩余页面迁移、PWA 等外围功能对齐、真实 API 写操作、完整项目类型错误清理、真实 CDN/低速网络性能测试。
