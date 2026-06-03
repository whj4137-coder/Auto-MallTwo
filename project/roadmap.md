# Roadmap — Apex Drive Store V2

> 阶段驱动。每个 Phase 有明确交付物与**完成定义（DoD）**，全部勾选才算达成。
> 问题转 [issues.md](issues.md)，进度同步 [../sessions/session-log.md](../sessions/session-log.md)。

## 总览

```
Phase 0: 治理框架    Phase 1: 需求分析    Phase 2: 设计输出
(2天)                (3天)                (5天)
  │                    │                    │
  ├─ INDEX 结构        ├─ Story Map         ├─ 原型（前台+Admin）
  ├─ 文档规范          ├─ User Stories      ├─ 系统架构文档
  ├─ 会话交接模板      ├─ 需求清单          ├─ 接口清单
  ├─ 问题跟踪表        └─ 验收标准          ├─ 测试方法与范围
  └─ Roadmap 骨架                           └─ DoD 定义
        │                    │                    │
        ▼                    ▼                    ▼
   Phase 3: Web 前端先行 → Phase 4: 后端 Express + Admin → Phase 5: 验收与演示就绪
```

| Phase | 名称 | 工期 | 状态 |
|-------|------|------|------|
| 0 | 治理框架 | 2 天 | ✅ 完成 |
| 1 | 需求分析 | 3 天 | ✅ 完成（**已评审冻结** 2026-05-29；SPEC-001..005 APPROVED，§10/§11 硬锁） |
| 2 | 设计输出 | 5 天 | ✅ 完成（19 页高保真静态稿 + 全套设计文档） |
| 3 | **Web 前端**（前台 P1–P13 + 搜索页） | — | ✅ 完成（含搜索独立页 /search） |
| 4 | 后端 Express + Admin（三端联动） | — | ✅ 核心 + Admin 完整 CRUD 完成 |
| 5 | 验收与演示就绪 | — | 🟢 基本完成（1.0.0 已发本地 tag、L1/L2 **30** 实跑绿、E2E **9** 绿含 LAYOUT-01 实跑、演示脚本、WebView APK 工具链验证产出 debug 包、本地单服务部署验证、P0/P1 清零；余 **公网部署 + APK 真实 URL + push** 待对外域名/remote，按用户决定暂缓） |

图例：✅ 完成　🟡 进行中　⬜ 未开始

> 实际栈（ADR-0004 + 偏差）：未走前端内 Mock，**前端与 Express 后端同步落地**（真后端替代 MSW），npm workspaces 代 pnpm（I-016）。三端共享 InMemoryStore，Admin 改→前台实时读。

## 切片视图（openspec changes ↔ 状态）
> 实现按能力切片，逐片走 openspec（[../openspec/README.md](../openspec/README.md) 变更提案索引）。

| Change | 切片 | 状态 | 落点 |
|--------|------|------|------|
| 0002 | 脚手架 + shared SSOT 镜像 + 双层门禁基座 | ✅ Accepted | Phase 3/4 |
| 0003 | 核心购物 A-01/A-02 + 2003 + 4009 | ✅ Accepted | Phase 3/4 |
| 0004 | 会员开通 B-01（互斥幂等） | ✅ Accepted | Phase 3/4 |
| 0005 | 演示控制与门禁前端（DemoBar/GateGuard/重置） | ✅ Accepted | Phase 3 |
| 0006 | Admin 六模块（+账号信息只读） | ✅ Accepted | Phase 4 |
| 0007 | Checkout 收货/配送后端权威字段 | ✅ Accepted | Phase 4 |
| 0008 | 工程门禁：SSOT 校验 + commit hook | ✅ Accepted | 全程 |
| 0001 | 首页改版（已并入 §10.8） | ✅ Accepted | Phase 3 |
| 0009 | 自动化测试 L1/L2/L3 | ✅ Accepted | Phase 5 |
| 0010 | Admin 完整 CRUD（新增·编辑） | ✅ Accepted | Phase 4 |
| 0011 | 商品插画（代码生成 SVG）+ Product.image | ✅ Accepted | Phase 3/4 |
| 0012 | 修复重复支付幂等 / 门禁优先级 / 搜索空查询 | ✅ Accepted | Phase 5 |
| 0013 | 补充自动化测试用例（空白端点 / 边界，纯补测试） | ✅ Accepted | Phase 5 |
| 0014 | EDGE-001..025 逐条 L2 落地（纯补测试） | ✅ Accepted | Phase 5 |
| 0015 | CART 结算按实时价（对齐 §15.12 EDGE-005，关 I-029） | ✅ Accepted | Phase 5 |
| 0016 | Checkout 校验 SKU 仍合法（对齐 §15.10.4 / EDGE-006） | ✅ Accepted | Phase 5 |
| 0017 | 校准 component-spec / frontend-files 至实现（派生文档追平） | ✅ Accepted | Phase 5 |
| 0019 | 工程纪律强化：提案先行闸门 + 分级规则 + 模板升级（机器守门） | ✅ Accepted | Phase 5 |
| 0018 | PRD §15.9 前台交互详规 ↔ 实现核对（父审计单，24 偏离全对齐） | ✅ Accepted | Phase 5 |
| 0020 | 前台加载/错误/空态/重试基座（§15.9 执行 1/3） | ✅ Accepted | Phase 5 |
| 0021 | P9 刷新恢复 + 防重点击（§15.9 执行 2/3） | ✅ Accepted | Phase 5 |
| 0022 | §15.9 交互细节对齐（11 条，执行 3/3） | ✅ Accepted | Phase 5 |
| 0023 | 会员加购错误码 + checkout 创建校验对齐（I-030/I-031） | ✅ Accepted | Phase 5 |

**评审冻结已完成（2026-05-29）**：0001/0006/0007/0010/0011 全 Accepted；SPEC-001..005 APPROVED；§10/§11 硬锁。0012/0015/0016 为冻结后代码对齐修复（不改契约）；0017 为派生工程文档追平实现。
**M-B ✅**：E2E 8（A-01/A-02/B-01/C-01/D-01/D-02/AUTH-01/SEARCH-01）；L2 29 已固化（含门禁矩阵 REQ-024 + Admin 下架·改价→前台实时）。**M-C ✅**：搜索独立页 `/search`；api-spec 增量已补。**M-F**：演示脚本 [../testing/demo-script.md](../testing/demo-script.md) ✅；P0/P1 清零 ✅；LAYOUT-01 1280×720 审计用例已固化（待可启动浏览器/允许本地监听环境实跑，见 I-019）；版本号/CHANGELOG 已切到 **1.0.0**。
**S-037 实跑收口**：①`npm run verify` 30 测全绿 + `test:e2e` 9/9 绿（含 LAYOUT-01）；②本机 openjdk@17 + Android SDK 构建 debug APK 成功（工具链验证）；③`build:release` + `start:prod` 本地单服务部署验证 `/`、`/admin`、`/api/*`；④本地 commit + `v1.0.0` tag。
**剩余（暂缓，待用户）**：公网部署到对外域名 → 用该域名重建 APK → 提供 git remote 后 push。

---

## Phase 0 · 治理框架（2 天）

**目标**：单 INDEX 入口 + 职责分区的文档治理体系就位，解决会话间状态丢失。

**交付物 / DoD**
- [x] INDEX 结构：`INDEX.md` 为唯一导航入口，纯路由表、不含业务内容
- [x] 文档规范：`CONTRIBUTING.md`（目录结构 / 职责分区 / SSOT 规则 / 文档写作 / PR 规范）
- [x] 会话交接模板：`sessions/_template.md`（Session 编号格式）
- [x] 问题跟踪表：`project/issues.md`（类型/优先级/状态 + 列定义）
- [x] Roadmap 骨架：本文件（Phase 0–5）
- [x] 启动护栏文件：`CLAUDE.md`（背景 + 硬约束，不含结构信息）
- [x] 变更提案流程：`openspec/README.md` + `changes/_template.md`
- [x] 目录分区创建：product / design / engineering / testing / project / sessions / openspec
- [x] `project/decisions.md` 初始化（ADR-0001 治理结构 / 0002 api-spec 字段标准 / 0003 测试覆盖）
- [x] 需求文档原文已并入 `product/prd.md`（原 source-brief 归档，I-001 已关闭）

---

## Phase 1 · 需求分析（3 天）

**目标**：把需求文档拆解为可执行、可验收的业务定义，锁定全部字面值与文案（WHAT 冻结）。

> 注：原拆分的 story-map / user-stories / requirements / data-contracts / copy-bible 六份文件已按 ADR-0005 合并入单一 [product/prd.md](../product/prd.md)，下列产出对应其章节。

**交付物 / DoD**
- [x] 用户故事地图（PRD §5）：6 大活动、购物/会员/展示三条主线、按 Release 切片
- [x] 用户故事（PRD §6）：US-001..024 含角色/动机/关联 + §6.1 Gherkin
- [x] 需求清单（PRD §7）：REQ-001..042 含优先级（P0–P3）+ 验收标准
- [x] 功能清单（PRD §4）：F-01..F-27
- [x] 验收标准：7+ 条业务流程（PRD §8）映射到 REQ 验收项
- [x] 数据契约（PRD §10 ★SSOT）：10 商品 / 5 类目 / 3 Banner / 用户·地址·车辆 / 订单号 / 金额（含 priceCents）
- [x] 文案锁定（PRD §11 ★SSOT）：COPY-001..046
- [x] 门禁矩阵（PRD §3.3）可机器对照（REQ-024）
- [x] 评审冻结（2026-05-29）：PRD §10/§11 进入「改动须走 openspec」状态；SPEC-001..005 APPROVED

**冻结判据**：评审确认后，PRD §10/§11 进入「改动须走 openspec 提案」状态。

---

## Phase 2 · 设计输出（5 天）

**目标**：把 WHAT 翻译为可实现的设计与接口契约，并定义 DoD。

**交付物 / DoD**
- [x] `design/benchmarking.md`：车机商城调研 + 补充项（REQ-026..033）
- [x] `design/prototype/README.md`：13 前台(P1-P13) + Admin 六模块线框蓝图，覆盖 5 种布局形态；A-01 高保真静态稿已出（高保真全量由用户后续产出）
- [x] 蓝图标注 1280×664 无滚动约束
- [x] `design/system-architecture.md`：三端关系、内存态管理、Mock 数据层、门禁双层、时序
- [x] `design/api-spec.md`：API-001..026 含 9 字段（ADR-0002）+ 接口契约详例 + 数据模型，错误码齐全
- [x] `design/design-tokens.md`（★SSOT）：颜色/渐变/圆角/间距/字号/布局/触控/反馈
- [x] `engineering/`：tech-stack（ADR-0004）/ dev-guide / build-variants
- [x] `testing/test-strategy.md` + `test-cases.md`(TC-001..025) + `coverage-matrix.md`：含完整业务流程集成/E2E（ADR-0003）+ 边界 EDGE/埋点
- [x] **DoD 定义**：Phase 3–5 DoD 已细化（见各 Phase + test-strategy 通过标准）
- [x] 高保真原型文件（HTML）：19 页深色座舱静态稿已入库 design/prototype/

---

## Phase 3 · Web 前端先行（工期 TBD）

**目标**：演示者在前台手动跑完全部核心路径（数据先用前端 Mock/MSW，shape 同 §10 种子）。对应 Epic E1–E4。

**DoD**
- [x] Demo Bar（三组开关 + 重置，自身不被门禁拦截）+ SideNav（5 项高亮）
- [x] 13 页面（P1–P13）按深色座舱实现，LAYOUT-01 已固化待授权环境复跑
- [x] A-01 实物购物车购买 → ORDER-P-001 已支付（含同 SKU 合并）
- [x] A-02 立即购买（购物车不变不变量成立）
- [x] B-01 会员开通 → ORDER-M-001 + ACTIVE + 详情按钮态切换（月/年卡互斥）
- [x] C-01 展示服务不可购买（前端无入口）
- [x] AUTH-01 / D-01 / D-02：拦截、自动续作、置灰、toast 文案正确
- [x] SEARCH-01：substring（仅实物+会员）/ 空结果 / 行车·断网禁用 + 语音占位
- [x] 订单中心可点进订单详情 P13
- [x] 「我的」固定 Mock + 实时会员状态

---

## Phase 4 · 后端 Express + Admin 管理后台（工期 TBD，见 I-011）

**目标**：后端提供种子数据与门禁/错误码，替换前端 Mock；Admin 完整管理后台可运营。对应 Epic E5 + E4 服务端校验。

**实现顺序（Admin 核心先行）**：先做可演示核心——**商品上下架 + 订单查看 + 演示会话**，再补 商品/Banner/服务的完整 CRUD。

**DoD**
- [x] 后端种子载入 10 商品 / 5 类目 / 3 Banner / Mock 用户（含 published/sortOrder）
- [x] 写入门禁：未登录 1001、行车 2001、断网 2002、展示服务写入 2003
- [x] 购物车/checkout（cart/buy-now）/模拟支付/订单生成；订单号独立递增；金额按分；Demo 重置
- [x] 上下架机制：前台仅读 published；购物车含下架品结算拦截 4009/COPY-045；历史订单不受影响
- [x] Admin 核心：商品上下架 / 订单查看(筛选) / 演示会话（REQ-035/037/040/041）
- [x] Admin 其余：Banner/服务/商品完整 CRUD（REQ-037/038/039）
- [x] 网络超时（连 10s / 读 15s / 写 15s）；前台改为读后端实时数据

---

## Phase 5 · 验收与演示就绪（工期 TBD）

**目标**：质量达标，可作为评审演示交付。

**DoD（待 Phase 2 细化）**
- [x] `testing/test-cases.md` + `coverage-matrix.md` 完成且核心用例自动化覆盖
- [x] 门禁矩阵每格行为验证通过（L2 固化）
- [x] 字面值/文案与 SSOT 100% 一致（无硬编码偏差，W 类问题清零）
- [x] 1280×720 横屏无意外滚动（LAYOUT-01 已实跑绿，2026-06-02 S-037）
- [x] 冷启动走完完整购买路径 ≤ 10 分钟（演示脚本覆盖）
- [x] 5–10 分钟演示脚本整理归档
- [x] issues.md 中 P0/P1 清零

---

## 后期里程碑（从「核心闭环已实现」到「可交付演示」）

> 现状基线（S-035）：前台 P1–P13 + 后台全 CRUD + Express 后端 + 测试 L1/L2/L3 + 工程门禁均已落地；S-037 起在本机普通环境 `verify` 与 LAYOUT-01 已实跑全绿。openspec 切片 0001–0017 已 Accepted。
> 关键路径：M-A/M-B/M-C 主体已完成；M-E 本期不做；当前只剩 M-F 终验复跑与发版提交。

| 里程碑 | 内容 | 依赖 | 量级 | 主责 |
|--------|------|------|------|------|
| **M-A 评审冻结** | ✅ changes 0001/0006/0007/0010/0011 Accepted；SPEC-001..005 APPROVED；§10/§11 进硬锁 | — | S | 用户 |
| **M-0 工程基建** | ✅ git init + commit-gate 生效 + npm workspaces；I-015 端口 3000 为外部进程且不阻塞项目 3001 | — | S | Agent |
| **M-B 测试补全** | ✅ E2E A-01/A-02/B-01/C-01/D-01/D-02/AUTH-01/SEARCH-01；L2 门禁矩阵与 Admin 实时生效固化 | M-A | M | Agent |
| **M-C 接口/文档收口** | ✅ api-spec 增量、Checkout 字段、Admin 写操作、搜索独立页、入口文档已收口 | M-A | M | Agent |
| **M-D 技术债清理** | 🟡 `npm run build:web` 已验证；pnpm 迁移转 WONT_FIX；端口/env 与依赖审计作为后续优化 | — | S | Agent |
| **M-E 车机承载** | WONT_FIX：Demo 阶段仅 PC 横屏演示（ADR-0009） | M-C | M–L | 待定 |
| **M-F 验收 & 演示就绪** | 🟢 演示脚本、P0/P1 清零、CHANGELOG/版本号、WebView APK 工具链验证、Docker 单服务部署已完成；S-037 实跑 verify+LAYOUT-01 全绿、本地单服务部署验证、本地 commit + `v1.0.0` tag；余公网部署/真实 URL APK/push 暂缓 | M-B,M-C | S | Agent |

**当前待办（暂缓，待用户）**：①公网部署到对外域名（本地单服务已验证）；②用该域名 `-PWEBVIEW_URL` 重建 APK；③提供 git remote 后 push；④如需释放 3000 端口，由用户结束外部 Python 进程。

**建议顺序**：`部署 Web/API 到对外域名` → `用公网 URL 构建 APK` → `快速浏览前后台/APK` → `push（加 remote）`。
