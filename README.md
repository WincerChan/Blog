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
2. Astro loader 扫描并校验 frontmatter，使用官方 Unified processor 和现有插件渲染 Markdown。
3. 保留原有 Atom、sitemap、搜索索引和加密逻辑；这些静态资源生成到 `.astro-public`，OG 由独立 Astro endpoint 生成。
4. 页面通过 `astro:content` 消费安全内容，生成 HTML；浏览器只激活交互 islands。

开发时监听新增、编辑和删除，同步路由、分类与生成文件。渲染缓存只在开发进程内复用；原始正文和密码不写入 Content Layer。

### 加密文章

若 front matter 包含 `encrypt_pwd`，构建过程会：

- 将文章 HTML 加密后存入 Content Layer 条目的 `html` 字段。
- 去除 `encrypt_pwd` 字段，避免在产物中泄露。
- 增加 `encrypted: true` 标记，前端提示输入密码。

### OG 图片

`src/astro/pages/og/[image].png.ts` 在生产构建时输出原有 `/og/*.png`；开发时仅在访问图片 URL 时渲染。保留现有 Satori 排版和 resvg 栅格化，使用 Sharp 异步无损编码 PNG，避免在主线程逐张压缩图片。

完整 PNG 缓存在 `.cache/og/`。展示内容、模板、字体、渲染器依赖或尺寸改变时失效；缓存读入时校验完整性。`bun run clean` 保留该缓存，`bun run clean:og` 显式清除。CI 必须保存并恢复 `.cache/og/` 才能跨部署复用；缓存不是部署产物。旧图片不会因为仍在缓存中而重新进入发布路由。

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
