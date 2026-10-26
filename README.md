# Wincer's Blog

基于 Astro Content Layer + SolidJS islands 构建的个人博客。当前迁移位于 `codex/astro-solid-experiment` 分支；历史的 Hugo + SolidStart 版本保留在 `legacy/hugo-solidstart` 分支。

English version: `README.en.md`

## 特性

- Astro 静态输出，ClientRouter 负责站内导航
- Astro Content Collections 内容管线（`_blogs/content` → 自定义 loader → 构建期安全内容）
- 多语言页面与文章
- 构建期生成 RSS/Atom、Sitemap 与公共资源
- 可选文章加密（输出只保留密文）
- Service Worker 更新提示

## 技术栈

- Astro + SolidJS islands
- Astro Content Layer（内容扫描、校验和开发监听）
- Vite + UnoCSS
- typesafe-i18n

## 目录结构

- `src/astro/pages/` 路由（内容页在 `src/astro/pages`）
- `src/features/pages/` 页面视图组件
- `src/astro/layouts/` 布局层
- `src/features/` 业务功能模块（如 `features/theme`）
- `tools/content/` 内容构建工具
- `_blogs/content/` Markdown 内容仓库
- `src/astro/content.config.ts` 内容集合定义（持久化数据只包含安全字段）

## 内容流程

1. 在 `_blogs/content/posts` 与 `_blogs/content/pages` 写作。
2. Astro loader 使用官方 `parseFrontmatter` 解析并校验元数据，交给官方 Unified processor 渲染 Markdown。标题锚点、目录数据和 Shiki 高亮由 Astro 提供；摘要、字数和搜索文本通过插件复用同一次解析的语法树。
3. 保留原有 Atom、sitemap、搜索索引和加密逻辑；这些静态资源生成到 `.astro-public`，OG 由独立 Astro endpoint 生成。
4. 页面通过 `astro:content` 消费安全内容，生成 HTML；浏览器只激活交互 islands。

目录只保留五级以内的正文标题；摘要在 `<!--more-->` 处截断（最多 260 字符），搜索保留代码、图片说明和公式原文。GFM 删除线、表格和脚注按正文语义提取，不再单独按 CommonMark 解析。迁移差异及验证见 [内容管线精简记录](experiments/astro-native-content/COMPARISON.md)。

开发时监听新增、编辑和删除，同步路由、分类与生成文件。生产构建在渲染前过滤草稿，并提前请求评论映射，与 Markdown 处理重叠；接口超时覆盖响应头和正文。

公开文章的 HTML、摘要、目录、字数和搜索文本持久化到 `.cache/content/`，按源文件和渲染配置校验复用。加密文章只在内存中处理，正文与密码不写入该缓存；文章转为草稿、加密或被删除时，会清除旧的公开缓存。开发模式使用进程内缓存。

### 加密文章

若 front matter 包含 `encrypt_pwd`，构建过程会：

- 将文章 HTML 加密后存入 Content Layer 条目的 `html` 字段。
- 去除 `encrypt_pwd` 字段，避免在产物中泄露。
- 增加 `encrypted: true` 标记，前端提示输入密码。

### OG 图片

`src/astro/pages/og/[image].png.ts` 在生产构建时输出原有 `/og/*.png`；开发时仅在访问图片 URL 时渲染。保留现有 Satori 排版和 resvg 栅格化，使用 Sharp 异步无损编码 PNG，避免在主线程逐张压缩图片。

完整 PNG 缓存在 `.cache/og/`。展示内容、模板、字体、实际安装的渲染器及其传递依赖、补丁或尺寸改变时失效（无关的锁文件变更不会使全部 OG 失效）；缓存读入时校验完整性。`bun run clean` 保留该缓存，`bun run clean:og` 显式清除。CI 必须保存并恢复 `.cache/og/` 才能跨部署复用；缓存不是部署产物。旧图片不会因为仍在缓存中而重新进入发布路由。

## 本地开发

```bash
bun install
bun run dev
```

仅构建内容：

```bash
bunx astro sync
```

## 构建

```bash
NODE_ENV=production bun run build
```

产物位于 `dist/astro`，适配 Cloudflare Pages 部署。

常规构建和 `build.sh` 保留缓存；`bun run clean` 仅清理生成产物，`bun run clean:content` 清理内容缓存，`bun run clean:og` 清理图片缓存，`bun run clean:all` 清理以上全部。CI 如需跨部署复用，应恢复 `.cache/content/` 和 `.cache/og/`。两者都不应发布到站点。

相同源输入的 Service Worker 版本和 CSS 输出保持稳定，Atom / sitemap 更新时间取自内容。加密文章仍使用随机 salt/IV，因此重复构建的加密页面密文字节可以不同。

## 构建脚本（可选）

`build.sh` 会：

- 安装依赖
- 拉取 `_blogs` 内容
- 构建内容与站点

如果内容仓库为私有，需设置 `GH_TOKEN`。

## 环境变量

- `GH_TOKEN`（可选）：`build.sh` 用于拉取私有内容仓库
- `CF_PAGES_BUILD_ID` / `CF_PAGES_COMMIT_SHA`：用于生成 SW 版本哈希
- `INKSTONE_API_BASE`（可选）：Inkstone API 地址，同时用于内容构建和浏览器 bundle；未设置时 dev 使用 `http://localhost:8080`，prod 使用 `https://inkstone.itswincer.com`

## 备注

- 内容仓库与代码仓库分离，需确保本地存在 `_blogs/`。
- `.astro` 与 `.astro-public` 为生成数据；部署目录为 `dist/astro`。
