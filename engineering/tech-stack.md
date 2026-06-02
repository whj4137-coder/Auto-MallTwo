# 技术选型 — Apex Drive Store V2

> **这是什么**：实现技术栈（HOW）。业务规则以 [../product/](../product/) 为准，本文件不重定义业务。
> **决策记录**：栈选型见 [../project/decisions.md](../project/decisions.md) ADR-0004（**Accepted**）。实际落地：前端与 Express 后端**同步实现**（未走 MSW/前端内 Mock，真后端直接提供数据），三端共享 InMemoryStore。

## 选型原则
1. 评审 Demo：5–10 分钟跑完核心路径，**横屏 PC 模拟环境**优先可运行。
2. 需快速产出原型与三端联动；前后端分离 + Admin。
3. 无真实支付/语音/外部依赖；数据内存态、可一键重置。

## 推荐栈（Web-first，车机 WebView 承载）

| 层 | 选型 | 理由 |
|----|------|------|
| 前台 App | React 18 + TypeScript + Vite | 1280×720 视口直接在 PC 浏览器跑；可 WebView 嵌入车机 |
| 样式 | Tailwind CSS + CSS 变量（映射 design-tokens） | 深色座舱主题；token 单源，暗色高对比易实现 |
| 状态 | Zustand（SessionState/auth·drive·net + TokenStore） | 轻量内存态，契合"重启回默认" |
| 路由 | React Router | SideNav 路由高亮 |
| Admin | 同栈复用（独立路由 /admin） | 降低维护成本 |
| 后端 | Node 20 + Express + TypeScript | Mock 服务最快；统一信封中间件 |
| 存储 | 进程内 InMemoryStore | 无 DB；重置即清空 |
| HTTP | Fetch + 封装（超时 连10/读15/写15s） | 对齐 REQ-025 |
| 测试 | Vitest（单测）/ Supertest（后端集成）/ Playwright（E2E 全流程 + 1280×720） | 对齐 ADR-0003 |
| 包管理 | npm workspaces（+ package-lock） | ADR-0004 偏差 I-016：未用 pnpm，按 npm workspaces 收口 |

> 车机目标：前台构建产物以 Android WebView 承载（横屏 1280×720 dp）。Demo 阶段以 PC 浏览器为主运行环境。

## 备选栈（原生 Android）
如评审要求原生：前台 Kotlin + Jetpack Compose（横屏），后端 Kotlin + Spring Boot + 内存存储，测试 JUnit/Compose UI Test/Espresso。代价：原型与联调更慢，故 Demo 不作首选。

## 不引入
- 真实支付 SDK、语音 SDK、数据库、鉴权三方、推荐/优惠/评价系统、明暗主题、i18n。

## 目录（前后端分离，建议）
```
apps/
  web/        前台 + Admin（React/Vite）
  server/     后端（Express）
packages/
  shared/     共享类型（Product/Order/错误码/状态枚举，源自 PRD §10 数据契约）
```
