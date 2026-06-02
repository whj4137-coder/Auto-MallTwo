# 决策记录（ADR）— Apex Drive Store V2

> 记录值得长期保留的技术/产品/治理取舍。格式：背景 → 决策 → 理由 → 影响 → 状态。
> 编号 `ADR-NNNN` 全局递增不复用。新决策追加在底部。

---

## ADR-0001 · 文档治理结构：单 INDEX 入口 + 职责分区 + SSOT

- **状态**：Accepted（2026-05-29）
- **背景**：车机商城 Demo 涉及前台/Admin/后端三端，且大量内容为字面值与文案锁定。若把结构、导航、业务、护栏混在一处，会话间易丢状态、代码与文档易漂移。
- **决策**：
  1. `INDEX.md` 为**唯一导航入口**，纯路由表，不含业务内容。
  2. 结构与协作规范集中在 `CONTRIBUTING.md`；**不放进 CLAUDE.md**。
  3. `CLAUDE.md` 仅承载「背景 + 硬约束护栏 + 入口指引」，供 Agent 启动读取。
  4. 按职责分区：`product/`(WHAT) / `design/` / `engineering/`(HOW) / `testing/` / `project/` / `sessions/` / `openspec/`。
  5. 设 **SSOT（唯一真值）**：`product/prd.md §10 数据契约`、`product/prd.md §11 文案锁定`、`design/design-tokens.md`。代码禁止出现 SSOT 之外的业务字面值/文案。（注：§10/§11 原为独立文件，已按 ADR-0005 合并入 PRD）
- **理由**：单入口降低查找成本；职责分区强制 WHAT/HOW 解耦；SSOT 防止字面值漂移；护栏与结构分离让启动文件保持精简。
- **影响**：所有新文档须在 INDEX 登记；改 SSOT 须走 openspec 提案（先改文档再改代码）。

---

## ADR-0002 · 接口清单（api-spec）字段标准

- **状态**：Accepted（2026-05-29）
- **背景**：需要一份能同时支撑「前后端对齐」与「测试用例生成」的接口清单格式；用户提出该诉求但未给定具体字段。
- **决策**：`design/api-spec.md` 中每个接口必须包含以下字段：
  1. **API-ID**（`API-NNN`）
  2. **接口名称 / 用途**
  3. **Method + Path**（如 `POST /cart`）
  4. **鉴权与门禁前置**（是否需登录；写入类须标注 `LOGGED_IN AND PARKED AND ONLINE`）
  5. **请求入参**（字段 / 类型 / 必填 / 约束，如数量 [1,5]）
  6. **成功出参**（data 结构 + 示例；金额字段为 `priceCents`）
  7. **错误码**（引用错误码表 1001/1002/2001/2002/2003/4000/4004/4009/5000，并标注本接口特有触发条件，如展示服务写入→2003）
  8. **关联需求**（`REQ-NNN`）
  9. **备注**（幂等性、Demo 重置影响等）
- **理由**：字段覆盖入/出/错误/鉴权/关联，足以让前端 Mock、后端实现、测试用例三方对齐。
- **影响**：Phase 2 产出 api-spec 时按此模板；用户如提供自有字段集，以本 ADR 的更新版为准（走变更即可）。

---

## ADR-0003 · 测试范围：必须覆盖完整业务流程的集成/E2E

- **状态**：Accepted（2026-05-29）
- **背景**：用户明确指出风险——「测试范围仅限主流程接口测试，缺乏完整业务流程的集成测试」。
- **决策**：
  1. 测试不止于接口级单测，必须覆盖 7+ 条**完整业务流程**端到端：A-01 / A-02 / B-01 / C-01 / AUTH-01 / D-01 / D-02 / DEMO-01 / SEARCH-01。
  2. `testing/coverage-matrix.md` 建立「单测 / 集成 / E2E / Emulator」× 业务流程 的覆盖矩阵。
  3. 门禁矩阵（登录×驾驶×网络）每个关键单元格须有对应用例。
  4. SSOT 一致性纳入测试项：断言 UI 文案/字面值与 PRD §11/§10 一致（W 类偏差应被测出）。
- **理由**：Demo 的价值在完整闭环与门禁行为，接口级测试无法保证流程正确与续作逻辑。
- **影响**：Phase 2 的 test-strategy 与 Phase 5 验收以此为准；DoD 含「完整流程用例通过 + W 类清零」。

---

## ADR-0004 · 技术栈：Web-first（车机 WebView 承载）

- **状态**：Accepted（2026-05-29，用户确认「前期用 Web 先实现前端」；I-005/I-006 已关闭）
- **背景**：需在「横屏 PC 模拟环境」5–10 分钟跑完演示，并快速产出原型 + 三端联动；无真实支付/语音/DB。
- **决策**：前台+Admin = React+TS+Vite+Tailwind（深色座舱主题，token 映射 design-tokens）；状态 Zustand（内存态）；后端 = Node+Express+TS + 进程内 InMemoryStore；测试 = Vitest/Supertest/Playwright；车机以 Android WebView 承载前端产物。备选：原生 Kotlin/Compose + Spring Boot（更慢，不作 Demo 首选）。
- **理由**：Web 栈在 PC 横屏直接可跑、原型与联调最快，满足 Demo 目标与 ADR-0003 测试分层；车机通过 WebView 承载即可。
- **决定（2026-05-29）**：**前期先用 Web 实现前端**（前端先行，可先用前端内 Mock / MSW，后端 Express 随后补齐）。R5/R9 命令统一为 `pnpm lint && pnpm test`、测试用 Vitest/Playwright。
- **影响**：详见 [../engineering/tech-stack.md](../engineering/tech-stack.md)。后续如追加原生 Android，仅为该端补 Gradle 校验，不影响 Web 主线。

---

## ADR-0005 · 需求文档合并为单一 PRD（修订 ADR-0001 的文件粒度）

- **状态**：Accepted（2026-05-29）
- **背景**：product/ 曾拆为 story-map / user-stories / requirements / data-contracts / copy-bible / source-brief 六份，互相交叉引用，维护成本高、易混乱（用户强制要求收敛）。
- **决策**：
  1. 业务需求**只保留一份** `product/prd.md`，含：项目定位/角色/门禁/功能清单/用户故事地图/用户故事/需求清单/业务流程/页面规格/数据契约(§10★SSOT)/文案锁定(§11★SSOT)/错误处理/不做范围/验收。
  2. 删除上述六份独立文件；原 SSOT 由独立文件改为 **PRD 内的章节**（§10/§11），地位不变。
  3. **不新增** feature-spec 独立文件：功能清单作为 PRD §4 章节存在（避免再次碎片化）。
  4. `design/design-tokens.md` 仍为独立文件（属设计域，非需求）。
- **理由**：单一 PRD 更易维护、检索、版本化；对小型概念 Demo，碎片化文档收益为负。
- **影响**：本决策**修订 ADR-0001 第 5 条的文件粒度**（SSOT 仍三处，但 §10/§11 落在 PRD 内）。全局交叉引用统一改指 `product/prd.md` 及其章节锚点。

---

## ADR-0006 · 采纳工程纪律 R5–R9

- **状态**：Accepted（2026-05-29）
- **背景**：AI agent 错误成本非对称（一个错命令的代价 >> 多次自检），需要可强制、逐动作的纪律来防止 spec/代码漂移与跨 session 状态丢失。
- **决策**：采纳并在 [../CLAUDE.md](../CLAUDE.md) §3 固化五条强制纪律：
  - **R5** Pre-commit Gate：commit 前依次 `openspec validate --strict` +（代码，Web 栈）`pnpm lint && pnpm test`，输出附 `Verified:` 段；失败禁 commit，禁 `--no-verify`；未 init 时标 `Verified: openspec-not-initialized`。
  - **R6** Double Review：逐动作；Self-Review（4 问）+ 正交 Cross-Review；高风险 100% 双评审。
  - **R7** HANDOFF：每 active change 维护 `openspec/changes/<id>/HANDOFF.md`（无则仓库级 `openspec/HANDOFF.md`）；session 始读、终更新三栏。
  - **R8** Change Log：归档同步 `CHANGELOG.md [Unreleased]`（Keep a Changelog 1.1.0 六类）；发版滚动版本号。
  - **R9** Scenario-First（先 `#### Scenario:` 再测试 再实现）+ Step Hooks（`.pre-commit-config.yaml` 装并启用）+ 测试四级（L1–L4，核心流程 A-01/A-02/B-01 happy path 必过 L3，demo 前一天跑 L4）。
- **理由**：把"靠自觉"变为"git/流程强制"，错误越早拦越便宜。
- **影响**：新增 `CHANGELOG.md`、`docs/templates/HANDOFF.template.md`、`openspec/HANDOFF.md`、`.pre-commit-config.yaml`。**R5/R9 的 Gradle/Kotlin 命令暗示原生 Android 栈，与 ADR-0004（Web-first）冲突 → I-006 待定栈后统一**。

---

## ADR-0007 · 视觉方向：深色座舱（Dark Cockpit），取代蓝白液态玻璃

- **状态**：Accepted（2026-05-29，用户决定弃用蓝白液态玻璃）
- **背景**：原蓝白液态玻璃主题被弃用；需更贴合车机场景的视觉。
- **决策**：采用**深色座舱（Dark Cockpit）**：近黑底 #0E1116 / 面板 #171B22 / 主字 #F2F5FA / 强调电青绿 #22D3C5 / 价格琥珀金 #FFB020 / 成功 #34D399。仅一套主题、无明暗切换。完整 token 见 [../design/design-tokens.md](../design/design-tokens.md)。
- **理由**：现代车机主流（Tesla/NIO/MBUX），夜间不刺眼、高对比可扫读、高级感强。
- **影响**：更新 design-tokens.md（SSOT）、PRD §1/§9、CLAUDE §2.4、engineering、prototype（tokens.css + p1-home.html）。原 `glass.*` token 改为 `effect.*`。
- **注**：补充需求文档第十节「科技蓝/适度玻璃质感」与本 ADR 冲突，**以本 ADR 为准**。用户 2026-05-29 复核确认 **维持深色座舱 + 电青绿 #22D3C5**（冲突关闭）；若日后改科技蓝再起新 ADR。

---

## ADR-0008 · v1 范围扩张：完整 Admin 管理后台 + 上下架机制 + 后端种子数据

- **状态**：Accepted（2026-05-29，依用户补充需求文档）
- **背景**：补充需求明确系统含 Android 车机端 + 后端 + Admin 三部分，**Admin 为可运营的完整后台**（非只读），数据为后端种子（前端不写死），并引入上下架机制。原 PRD 将 Admin 定为 4 页只读、Admin/后端定为「下一期」，需修订。
- **决策**：
  1. Admin 升级为六模块完整后台（登录/商品/Banner/服务/订单/演示会话，含 CRUD + 上下架）→ REQ-023/036-041、§9.5、SPEC-004。
  2. 新增上下架机制（published/sortOrder）：可见性 + 购物车下架结算拦截(4009/COPY-045) + 历史订单不受影响 → REQ-035。
  3. 数据为后端种子，Admin 改、前台实时读（前台只读接口仅返回 published=true）→ system-architecture §3、api-spec。
  4. 搜索范围收窄为「实物+会员」，排除展示服务 → REQ-003。
  5. v1 范围含三端（**不延后 Admin/后端**）；实现顺序仍前端先行（ADR-0004），仅工程节奏。
- **理由**：贴合「非单纯前端 Mock、具运营配置能力」的产品定义。
- **影响**：PRD 多节、api-spec、system-architecture、SPEC-004 新建；roadmap 后端/Admin 由「下一期」改为 v1 内（前端先行）。**修订 ADR-0004 中「Admin 下一期」的表述**。

---

## ADR-0009 · 评审冻结（2026-05-29）：SPEC 锁定 + 实现切片 Accepted + 工程门禁
- **状态**：Accepted
- **背景**：实现已落地（前台 P1–P13 + 后台全 CRUD + 后端 + 测试），openspec 切片 0002–0011 待评审；SPEC-001..005 仍 DRAFT。需冻结口径以防漂移。
- **决策**（依据 [openspec/REVIEW-CHECKLIST.md](../openspec/REVIEW-CHECKLIST.md) 全通过）：
  1. changes **0001/0006/0007/0010/0011 → Accepted**（首页新布局 / Admin 账号模块 / Checkout 收货字段 / Admin CRUD+错误码4000 / 商品图 image 字段）。
  2. **SPEC-001..005 → APPROVED**；PRD §10/§11 进入「改动须走 openspec」**硬锁**（Phase 1 冻结判据达成，关 I-009/013/014）。
  3. PRD 同步：§10.8 首页改为 Bento+类目条+精选 rail+分类货架；§10.1 加 image 字段（§12 的 4000 / §15.14 下架代删 原已具备）；SPEC-004 纳入账号信息只读模块。
  4. 开放问题定夺：图片=矢量 SVG（真照片可覆盖）；Admin 表单=FormModal；搜索=独立页(M-C)；详情不实时刷新；车机 WebView 本期不做。
- **工程门禁**：`verify`(typecheck+check:ssot+test) + commit-gate hook 持续守护 SSOT 不漂移。
- **影响**：后续改 §10/§11/SPEC 必须先走 openspec change。下一步进入 M-B 测试补全 / M-C 接口文档收口。
