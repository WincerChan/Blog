# Wincer's Blog

基于 Solid 2 + Velite 构建的个人博客。当前默认分支（`master`）为 Velite 版本；历史的 Hugo + SolidStart 版本保留在 `legacy/hugo-solidstart` 分支。

English version: `README.en.md`

## 特性

- Solid 2 异步预渲染，部署完整静态 HTML
- Velite 内容管线（`_blogs/content` -> `.velite` -> `public/_data`）
- 多语言页面与文章
- 构建期生成 RSS/Atom、Sitemap 与公共资源
- 可选文章加密（输出只保留密文）
- Service Worker 更新提示

## 技术栈

- SolidJS / @solidjs/web 2.0.0-rc.9
- @solidjs/router 2.0.0-next.27 + filesystem-routing
- @solidjs/vite-plugin 3.0.0-next.44（内置入口与 SSR）
- Velite（内容管线）
- Vite + UnoCSS
- typesafe-i18n

## 目录结构

- `src/routes/` 路由（内容页在 `src/routes/(pages)`）
- `src/features/pages/` 页面视图组件
- `src/layouts/` 布局层
- `src/features/` 业务功能模块（如 `features/theme`）
- `tools/velite/` 内容构建工具
- `_blogs/content/` Markdown 内容仓库
- `public/_data/` 运行时 JSON 数据

## 内容流程

1. 在 `_blogs/content/posts` 与 `_blogs/content/pages` 写作。
2. Velite 解析 Markdown 并生成 `.velite/*.json`。
3. 构建期生成 `public/_data` 供运行时读取。
4. 前端从 `public/_data` 读取内容渲染。

### 加密文章

若 front matter 包含 `encrypt_pwd`，构建过程会：

- 将文章 HTML 加密后写入 `public/_data/posts/*.json` 的 `html` 字段。
- 去除 `encrypt_pwd` 字段，避免在产物中泄露。
- 增加 `encrypted: true` 标记，前端提示输入密码。

## 本地开发

```bash
bun install
bun run dev
```

仅构建内容：

```bash
bun run content:build
```

## 构建

```bash
NODE_ENV=production bun run build
```

需要 Node.js 24+ 和 Bun。内容构建显式加载本地 `.env`；已有进程环境变量优先。

Vite 先生成 `dist/client` 与 `dist/server`，再由 `tools/build/prerender.mjs` 根据 `public/valid_paths.txt` 和 `/404/` 渲染完整 HTML。全部路由成功后写入 `.output/public`，同时生成 `404.html`，适配 Cloudflare Pages 等静态托管，无需部署 Node 服务或 Nitro。

`bun run preview` 启动静态预览。

## 验证

```bash
bun test
NODE_ENV=production bun run build
bun run test:e2e
```

浏览器测试需要本机安装 Google Chrome，自动启动静态预览与开发服务器（端口 4174 / 5174）。测试覆盖水合、站内导航、多语言、主题、搜索、评论、点赞、代码复制和无 JavaScript 的静态文章；外部 API 使用测试数据。

`bun run i18n --no-watch` 生成字典；`.typesafe-i18n.json` 禁用内置适配器生成，以保留 `src/i18n/i18n-solid.ts` 的 Solid 2 适配实现。

## 构建脚本（可选）

`build.sh` 会：

- 安装依赖
- 拉取 `_blogs` 内容
- 构建内容与站点

如果内容仓库为私有，需设置 `GH_TOKEN`。

## 环境变量

- `INKSTONE_PUBLIC_TOKEN_SECRET`：生产内容构建必需的 Inkstone 签名密钥，仅供构建使用；可在本地 `.env` 或部署环境中配置
- `GH_TOKEN`（可选）：`build.sh` 用于拉取私有内容仓库
- `CF_PAGES_BUILD_ID` / `CF_PAGES_COMMIT_SHA`：用于生成 SW 版本哈希
- `INKSTONE_API_BASE`（可选）：Inkstone API 地址，同时用于 Velite 构建和浏览器 bundle；未设置时 dev 使用 `http://localhost:8080`，prod 使用 `https://inkstone.itswincer.com`

## 备注

- 内容仓库与代码仓库分离，需确保本地存在 `_blogs/`。
- `public/_data` 为构建产物，不应包含明文密码。
