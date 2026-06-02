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
| 5 | 验收与演示就绪 | — | 🟢 接近完成（测试 37、门禁矩阵、演示脚本、P0/P1 清零；余 1280×720 无滚动审计 + 发版） |

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

**评审冻结已完成（2026-05-29）**：0001/0006/0007/0010/0011 全 Accepted；SPEC-001..005 APPROVED；§10/§11 硬锁。
**M-B ✅**：E2E 8（A-01/A-02/B-01/C-01/D-01/D-02/AUTH-01/SEARCH-01）；L2 29（含门禁矩阵 REQ-024 + Admin 下架·改价→前台实时）。**M-C ✅**：搜索独立页 `/search`；api-spec 增量已补。**M-F**：演示脚本 [../testing/demo-script.md](../testing/demo-script.md) ✅；P0/P1 清零 ✅；**余**：1280×720 无滚动审计（手动）+ 发版（CHANGELOG [Unreleased]→版本号，用户确认）。
**下一步**：①1280×720 无滚动人工/E2E 审计 → ②发版打 tag（待用户拍版本号）→ 可交付演示。

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
- [ ] 高保真原型文件（Figma/HTML）：由用户产出后入库 design/prototype/

---

## Phase 3 · Web 前端先行（工期 TBD）

**目标**：演示者在前台手动跑完全部核心路径（数据先用前端 Mock/MSW，shape 同 §10 种子）。对应 Epic E1–E4。

**DoD**
- [ ] Demo Bar（三组开关 + 重置，自身不被门禁拦截）+ SideNav（5 项高亮）
- [ ] 13 页面（P1–P13）按深色座舱实现，1280×720 免滚动
- [ ] A-01 实物购物车购买 → ORDER-P-001 已支付（含同 SKU 合并）
- [ ] A-02 立即购买（购物车不变不变量成立）
- [ ] B-01 会员开通 → ORDER-M-001 + ACTIVE + 详情按钮态切换（月/年卡互斥）
- [ ] C-01 展示服务不可购买（前端无入口）
- [ ] AUTH-01 / D-01 / D-02：拦截、自动续作、置灰、toast 文案正确
- [ ] SEARCH-01：substring（仅实物+会员）/ 空结果 / 行车·断网禁用 + 语音占位
- [ ] 订单中心可点进订单详情 P13
- [ ] 「我的」固定 Mock + 实时会员状态

---

## Phase 4 · 后端 Express + Admin 管理后台（工期 TBD，见 I-011）

**目标**：后端提供种子数据与门禁/错误码，替换前端 Mock；Admin 完整管理后台可运营。对应 Epic E5 + E4 服务端校验。

**实现顺序（Admin 核心先行）**：先做可演示核心——**商品上下架 + 订单查看 + 演示会话**，再补 商品/Banner/服务的完整 CRUD。

**DoD**
- [ ] 后端种子载入 10 商品 / 5 类目 / 3 Banner / Mock 用户（含 published/sortOrder）
- [ ] 写入门禁：未登录 1001、行车 2001、断网 2002、展示服务写入 2003
- [ ] 购物车/checkout（cart/buy-now）/模拟支付/订单生成；订单号独立递增；金额按分；Demo 重置
- [ ] 上下架机制：前台仅读 published；购物车含下架品结算拦截 4009/COPY-045；历史订单不受影响
- [ ] Admin 核心：商品上下架 / 订单查看(筛选) / 演示会话（REQ-035/037/040/041）
- [ ] Admin 其余：Banner/服务/商品完整 CRUD（REQ-037/038/039）
- [ ] 网络超时（连 10s / 读 15s / 写 15s）；前台改为读后端实时数据

---

## Phase 5 · 验收与演示就绪（工期 TBD）

**目标**：质量达标，可作为评审演示交付。

**DoD（待 Phase 2 细化）**
- [ ] `testing/test-cases.md` + `coverage-matrix.md` 完成且用例通过
- [ ] 门禁矩阵每格行为验证通过
- [ ] 字面值/文案与 SSOT 100% 一致（无硬编码偏差，W 类问题清零）
- [ ] 1280×720 横屏无意外滚动
- [ ] 冷启动走完完整购买路径 ≤ 10 分钟
- [ ] 5–10 分钟演示脚本整理归档
- [ ] issues.md 中 P0/P1 清零

---

## 后期里程碑（从「核心闭环已实现」到「可交付演示」）

> 现状基线（S-025）：前台 P1–P13 + 后台全 CRUD + Express 后端 + 测试 L1/L2/L3(happy path) + 工程门禁，均可运行、verify 绿。openspec 切片 0002–0010 已落地。
> 关键路径：**M-A 评审冻结**是 M-B/M-C 语义工作的前提；M-0 立刻做；M-B/M-C 并行；M-E 待定；M-F 收尾。

| 里程碑 | 内容 | 依赖 | 量级 | 主责 |
|--------|------|------|------|------|
| **M-A 评审冻结** | 评审 changes 0001/0006/0007/0010；确认 PRD §10.8/§12(4000)/§15.14/SPEC-004；SPEC-001..005 DRAFT→APPROVED；§10/§11 进硬锁。清单见 [../openspec/REVIEW-CHECKLIST.md](../openspec/REVIEW-CHECKLIST.md) | — | S | 用户 |
| **M-0 工程基建** | git init + 首次提交（commit-gate 生效）；openspec init；pre-commit install（I-007）；清理 3000 端口（I-015）；定位「后台打开」现象 | — | S | Agent |
| **M-B 测试补全** | E2E 扩 A-02/C-01/D-02/SEARCH-01 + Admin 改→前台实时生效 + 重置闭环；门禁矩阵全格（REQ-024）；TC↔自动化映射落 coverage-matrix | M-A | M | Agent |
| **M-C 接口/文档收口** | api-spec 补 Admin 写操作(021/022/025)+Checkout 字段响应详例、并入 4000；搜索独立页（P2 重定向→真页）+ 语音占位；README/INDEX/architecture 终对齐 | M-A | M | Agent |
| **M-D 技术债清理** | pnpm 迁移（I-016，可选）；`.env`/端口可配置化；`npm run build:web` 产物验证；依赖审计 | — | S | Agent |
| **M-E 车机承载**（待确认） | 前端构建产物以 Android WebView 承载（横屏 1280×720）或仅 PC 演示打包；Demo 阶段可只跑 PC | M-C | M–L | 待定 |
| **M-F 验收 & 演示就绪** | 5–10 分钟演示脚本；1280×720 无滚动审计；冷启动购买 ≤10 分钟；P0/P1 清零；CHANGELOG 发版 `[Unreleased]→[1.0.0]` | M-B,M-C | S | Agent |

**待用户决定**：①M-E 车机 WebView 本期是否做（不做则仅 PC 横屏演示，推荐）；②M-A 评审冻结（清单已备）；③「后台打开有问题」现象（并入 M-0）。

**建议顺序**：`M-0（立刻）` → `M-A（用户评审）` → `M-B + M-C 并行` → `M-F 收尾`；`M-D` 穿插；`M-E` 看 ①。
