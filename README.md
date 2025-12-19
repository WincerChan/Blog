# Wincer's Blog

基于 SolidStart + Velite 构建的个人博客。当前默认分支（`master`）为 Velite 版本；历史的 Hugo + SolidStart 版本保留在 `legacy/hugo-solidstart` 分支。

English version: `README.en.md`

## 特性

- SolidStart 静态输出（static preset）
- Velite 内容管线（`_blogs/content` -> `.velite` -> `public/_data`）
- 多语言页面与文章
- 构建期生成 RSS/Atom、Sitemap 与公共资源
- 可选文章加密（输出只保留密文）
- Service Worker 更新提示

## 技术栈

- SolidStart + SolidJS
- Velite（内容管线）
- Vite + UnoCSS
- typesafe-i18n

## 目录结构

- `src/routes/` 路由（内容页在 `src/routes/(pages)`）
- `src/pages/` 页面视图组件
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
pnpm install
pnpm dev
```

仅构建内容：

```bash
pnpm content:build
```

## 构建

```bash
pnpm build
```

产物位于 `.output/public`（static preset），适配 Cloudflare Pages 部署。

## 构建脚本（可选）

`build.sh` 会：

- 安装依赖
- 拉取 `_blogs` 内容
- 构建内容与站点

如果内容仓库为私有，需设置 `GH_TOKEN`。

## 环境变量

- `GH_TOKEN`（可选）：`build.sh` 用于拉取私有内容仓库
- `CF_PAGES_BUILD_ID` / `CF_PAGES_COMMIT_SHA`：用于生成 SW 版本哈希

## 备注

- 内容仓库与代码仓库分离，需确保本地存在 `_blogs/`。
- `public/_data` 为构建产物，不应包含明文密码。
