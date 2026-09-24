# 引用方式与剪枝复查

## 实验

在上一轮优化基础上，使用不写产物的客户端构建比较首页入口、首页路由及递归静态依赖。

- baseline：本轮修改前。
- direct-signals：仅在内存中将 Solid 封装层对 @solidjs/signals 的命名导入/再导出，按 barrel 导出表改写为实际模块路径，保留 Solid 水合封装；未采用。
- sideeffects：仅在实验中对 Solid 相关模块显式设 moduleSideEffects:false；未采用。包已经声明 sideEffects:false，不能解决实际引用。
- meta-direct：实验适配器绕开 @solidjs/meta 的通用 merge/omit；只用于估算，未加入项目。
- implementation：项目三个 SEO 组件直接使用 @solidjs/web 的 useHead，移除 @solidjs/meta 及其 optimizeDeps 配置；这是实际采用的实现。

| 方案 | 首页 JS bytes | Brotli 估算 bytes | optimistic renderedLength | store/utils renderedLength |
|---|---:|---:|---:|---:|
| baseline | 166693 | 52272 | 7090 | 14554 |
| direct-signals | 167329 | 52342 | 7090 | 14554 |
| sideeffects | 166693 | 52257 | 7090 | 14554 |
| meta-direct | 164870 | 51833 | 7090 | 11413 |
| implementation | 164770 | 51737 | 7090 | 11413 |

Brotli 为 Node 默认 quality 11，不是 HTTP 实测。renderedLength 是模块在最终 chunk 压缩前的统计，不能直接当作下载大小；其合计也不等于最终 JS 大小。构建中的时间型 SW 哈希可能造成几十字节的压缩波动，sideeffects 方案的微小差异不代表剪枝收益。

## 结论与引用链

直接深路径导入没有剪掉目标模块；不需要在生产配置中引入对依赖内部目录的硬编码。

store/utils 的通用 merge/omit 创建逻辑可以通过消除调用方剪掉一部分。本轮直接用 useHead 描述标签，没有复制或修改库的内部实现。剩余 sourceGet/sourceKeys/viewOf 等仍被 @solidjs/web 的 JSX 属性处理使用。

core/optimistic 的引用链为 Router createRouterContext → isPending/latest → core/verdict → installOptimisticEngine。安装器统一向 GlobalQueue 注册 optimisticWrite、resolveOptimisticNodes、overrideRead 等钩子。即使部分分支在博客中未触发，打包器也不能因为没有直接函数调用就删掉：它们通过共享调度器的字段间接执行。进一步精简需要上游拆分安装器/注册路径或提供裁剪入口，不是把 import 换成深路径就能安全做到。本轮没有将安装器标成 PURE，没有删除调度钩子，也没有修改 node_modules。

## 实际首页复测

沿用原 Chrome / serve / 冷缓存 / 禁用 SW / 1440×900 口径。本轮只重新采样首页，其他页面未重新做网络采样。

- 请求数：6 → 6。
- 全页传输：82217 → 81512 bytes（80.29 → 79.60 KiB）。
- 本次采样减少 705 bytes，约 0.69 KiB。
- 无失败或 pending 请求；数据见 direct-head-home.json。

## 验证

- NODE_ENV=production bun run build：PASS，103 路由。
- bun test：PASS，71 项。
- bun run test:e2e：PASS，11 项，包括导航、head 去重、多语言、favicon 和无 JS 页面。
- 与修改前的 103 页 title、meta、link 比较：一致。比较排除资源分包链接、内部 data-dh 标识以及构建时重新签发的 inkstone:token 内容。
- bunx tsc --noEmit --skipLibCheck：仍有既有错误；没有新增 src / vite.config 文件与错误码组合。
- git diff --check：PASS。
