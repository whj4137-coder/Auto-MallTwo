# Changelog

本文件记录项目所有值得注意的变更。
格式遵循 [Keep a Changelog 1.1.0](https://keepachangelog.com/zh-CN/1.1.0/)，版本遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

分组（六类）：Added / Changed / Deprecated / Removed / Fixed / Security。

> 维护规则（R8）：OpenSpec change 归档时必须在 `[Unreleased]` 同步加一行；发版时把 `[Unreleased]` 改为 `[X.Y.Z] — YYYY-MM-DD`，并在顶部新开空的 `[Unreleased]`。详见 [CLAUDE.md](CLAUDE.md) R8。

## [Unreleased]

### Changed
- **评审冻结（2026-05-29，ADR-0009）**：REVIEW-CHECKLIST 全通过 → changes **0001/0006/0007/0010/0011 → Accepted**；**SPEC-001..005 → APPROVED**；PRD §10/§11 进入硬锁（Phase 1 冻结判据达成）。PRD 同步 §10.8 首页新布局（Bento+类目条+精选 rail+分类货架，取代 精选3+服务3）、§10.1 加 image 字段；SPEC-004 纳入账号信息只读模块。关 I-009/I-013/I-014。

### Added
- 文档治理体系：`README.md`（总览）、`INDEX.md`（导航路由+仓库结构）、`CLAUDE.md`（启动护栏）、`CONTRIBUTING.md`（协作规范）。
- 单一产品需求文档 `product/prd.md`（含功能清单 §4、用户故事地图 §5、用户故事 §6、需求清单 §7 REQ-001..033、业务流程 §8、页面规格 §9、数据契约 §10 ★SSOT、文案锁定 §11 ★SSOT、错误处理 §12、验收 §14）。
- 设计文档：`design/benchmarking.md`、`system-architecture.md`、`api-spec.md`(API-001..023)、`design-tokens.md`(★SSOT)、`prototype/README.md`（页面蓝图）。
- 工程文档：`engineering/tech-stack.md`、`dev-guide.md`、`build-variants.md`。
- 测试文档：`testing/test-strategy.md`、`test-cases.md`(TC-001..020)、`coverage-matrix.md`。
- 项目管理：`project/roadmap.md`(Phase 0–5)、`issues.md`、`decisions.md`(ADR-0001..0006)。
- 变更提案：`openspec/README.md` + `changes/_template.md`。
- 会话交接：`sessions/_template.md` + `session-log.md`。
- 工程纪律 R5–R9：pre-commit gate、双评审、跨 session HANDOFF、Change Log 同步、Scenario-First + 测试分级。
- `CHANGELOG.md`（本文件）、`docs/templates/HANDOFF.template.md`、`openspec/HANDOFF.md`、`.pre-commit-config.yaml`（脚手架，待 git/toolchain 启用）。
- OpenSpec 规格落地：`openspec/specs/` + SPEC-001（核心购物）/ SPEC-002（会员）/ SPEC-003（演示控制与门禁），含 REQ→SPEC 覆盖映射。
- PRD §13.1「本期实现范围与边界（Web-only）」。
- 高保真静态界面：`design/prototype/tokens.css`（design-tokens 落 CSS 变量）+ `p1-home.html`（P1 首页，全局框架 Demo Bar/SideNav，纯视觉无逻辑）。
- 高保真静态稿全量收口（深色座舱 v7）：新增共享设计系统 `design/prototype/ui.css`（:root 令牌 + 全部组件），重做前台 P1–P13 + 新增后台 A0–A5（admin-login/products/banners/services/orders/session）共 19 页，`index.html` 索引前台+后台全部可点。
- OpenSpec 提案 `changes/0001-home-layout-bento-and-category-shelves.md`（首页改版：Bento+类目条+精选横滑 rail+分类货架，与 §10.8 锁定的差异先走提案，待评审冻结）。

### Changed
- `design/design-tokens.md`（★SSOT）同步 v7 座舱实际取值：基底 #0b0e13 / 面板 #141a23、字体三档（Chakra Petch / IBM Plex Sans / IBM Plex Mono + PingFang SC 兜底）、圆角 14/10、新增 grid+grain 效果令牌、焦点环改电青绿。
- `design/prototype/README.md` 更新为 19 页全量清单（ui.css 取代 tokens.css）+ P1 首页新布局描述。

### Removed
- 清理 P1 设计探索过程稿 `p1-home-v2..v7.html` 与旧 `tokens.css`（被 ui.css 取代）。

### Added
- **可交互全栈实现（核心闭环）**：monorepo（npm workspaces）落地 `apps/web`（Vite+React+TS+Zustand+React Router，前台 `/` + Admin `/admin`，复用 ui.css）、`apps/server`（Express+InMemoryStore，:3001，种子=§10）、`packages/shared`（类型/错误码/COPY 文案 SSOT 镜像）。
  - 后端 API-001..019 + Admin API-020/021/023/024；统一信封 `{code,message,data}`；双层门禁（auth 1001 / gate 2001·2002 / DISPLAY_SERVICE 2003）；OrderSequencer P/M；Demo 重置仅清会话数据。
  - 前台核心闭环 P1/P2/P3/P4/P5/P6/P7/P8/P9/P10/P11/P13 + LoginDialog；GateGuard + pending-action 续作；Admin A0 登录 / A1 商品（上下架·库存开关）/ A4 订单。
  - 联调验证：A-01 实物购物、B-01 会员开通、GUEST/DRIVING/SCOPE 门禁、Admin 均浏览器跑通（见 testing/test-strategy §7）。
- 前/后端文件汇总蓝图：`engineering/frontend-files.md`、`engineering/backend-files.md`。
- 预览服务器脚本 `.claude/preview-server.js`（Node 静态服务，替代沙箱受限的 python http.server）。

### Added
- **商品图（change 0011）**：新增 `Product.image` 字段 + seed 挂载 + `ProductMedia`（img + 图标兜底）接入 P2 大卡/首页/P3。图片来源经反复后定为**代码生成的座舱风矢量 SVG**（`scripts/gen-product-images.mjs` → `apps/web/public/products/{code}.svg`，10 张独特线稿、按类型配色）。中途试过的 loremflickr 免版权 JPEG 抓取已按用户要求撤销删除。本环境无照片级文生图、pencil 经否决，「直接 AI 生图」生成不了真实照片；真照片可外部生成后同名覆盖。

### Changed
- P2 分类页右侧：小横卡 `.scard` 网格 → **大商品卡**（2 列，大图标区 + 类型/名称/规格/价格 + 「查看详情 →」），点击进 P3 详情。纯呈现调整，不触 §10/§11/tokens（LeftFilter+RightGrid 形态不变）。
- `engineering/dev-guide.md` 运行命令改 npm workspaces（`npm run dev:server` / `dev:web`），补「前台/后台/接口分别用浏览器打开」入口。
- `design/api-spec.md`、`design/system-architecture.md` 增「实现状态/实现落地」段，标注已实现接口与路由合并。
- **Admin 补全为六模块**：新增前端 AdminBanners(API-022)/AdminServices(API-025)/AdminSession(API-026)/AdminAccount(个人+车辆只读，PRD §10.4) + 后端对应端点；左导航 CATALOG(商品/Banner/服务)·OPS(订单/会话)·ACCOUNT(账号)。
- **CLAUDE.md 重构**为规范结构（第一性原理 + 项目背景/核心架构/关键目录/开发流程/运行测试提交/编码规范/关键口径/坑点/强制校验），精简并下沉细节到 CONTRIBUTING/INDEX。
- README/INDEX 对齐：加 apps/packages 结构、可交互实现入口与运行命令。
- 根 `package.json` 加 `typecheck` 脚本（两端 tsc --noEmit）。

### Added
- **CLAUDE 驱动的提交门禁 hook**：`.claude/settings.json`(PreToolUse:Bash) → `.claude/hooks/commit-gate.sh`，拦截真正的 `git commit`：先跑 `npm run verify`，不过则 exit 2 阻断；命令含 `--no-verify` 直接阻断（仅匹配真实 git commit 调用，echo/printf 提及不误触发）。
- **SSOT 字面值校验** `scripts/check-ssot.mjs`（`npm run check:ssot`）：以 copy.ts(§11)+seed.ts(§10) 为镜像真值，扫描 apps/packages 源码，发现"完整字符串/JSX 文本"重复 SSOT 即报错（排除类目结构性标签、注释、子串误报）。已接入 `npm run verify` 与提交门禁 hook。
- 后端 Checkout 注入 `receiver`/`deliveryNote`（仅实物，后端权威），前台 Confirm 直接渲染。

### Fixed
- commit-gate hook 漏判 `git -c … commit` / `git --no-pager commit`（git 与 commit 间带 flag 时正则不匹配，门禁被静默绕过）；改为「有 git 调用 + 含 commit 子命令」双条件判定，容忍中间 flag。3 态复测通过。
- 清除前台硬编码 §10/§11 字面值：Confirm 收货人/地址/配送说明改用后端 checkout 字段；Cart 收货人取 `/me`；cartStore/Mine/AdminProducts/AdminOrders 文案改引用 `COPY.*`。check:ssot 现 0 重复。

### Added
- **Admin 完整 CRUD（change 0010）**：后端商品/Banner `POST` 新增 + 商品/Banner/服务 `PATCH` 改字段，字段校验返 `ERR.VALIDATION=4000`（名称空/类目错/价格非正/跳转目标不存在）；前端 `admin/FormModal` 通用表单 + AdminProducts/AdminBanners「编辑·新增」、AdminServices「编辑」。删除走下架（不做硬删，§15.14 待定）。L2 +5 例（共 23 测绿）；浏览器验改价同步前台、新增入列。I-011 RESOLVED。
- **自动化测试落地（change 0009）**：L1 Vitest（sequencer/shelf/money 6 例）+ L2 Supertest（`apps/server/src/api.test.ts` 12 例：信封/门禁 1001·2001·2002·2003/A-01/B-01 幂等/4009 下架·售罄/重置）+ L3 Playwright（`e2e/shop.e2e.ts` 4 例：A-01/B-01/AUTH-01/D-01，1280×720）。重构 `app.ts`(createApp 供 supertest)、`InMemoryStore.resetAll()`(测试隔离)。`npm test`/`test:e2e`；**L1/L2 并入 `npm run verify` + commit hook**，L3 单独跑。I-017 RESOLVED。
- **OpenSpec 切片化**：实现按能力拆为 changes 0002–0010（0002 脚手架/0003 核心购物/0004 会员/0005 门禁/0006 Admin六模块/0007 Checkout字段/0008 工程门禁 = Accepted；0009 自动化测试/0010 Admin CRUD = Draft）。openspec/README 加变更提案索引，roadmap 重切为「Phase 现状 + 切片视图（changes↔状态）」，HANDOFF 升级为多-change 总览。

### Added
- 高保真静态设计稿补齐前台全量：新增 P4 会员 / P5 展示服务 / P10 订单中心 / P11 我的 / P12 登录弹窗 / P13 订单详情（深色座舱，共享 tokens.css，对齐 component-spec/copy-bible/data-contracts）；index 索引全部可点；P1–P13 全出，余 Admin 六模块页待出。
- 「可直接编码」契约层（四层全补，专档权威 + PRD §15.18-15.21 镜像）：
  - A 接口契约：api-spec 新增「接口契约详例」（API-001..026 完整请求/响应 JSON + 4009.reason 区分下架/售罄/重复支付）。
  - B 前端状态/Store：新增 `engineering/frontend-spec.md`（Zustand 各 store 形状+actions+API 读写映射 + GateGuard + API 客户端错误映射）。
  - C 组件清单与字段绑定：新增 `design/component-spec.md`（通用组件 + P1-P13 + Admin 的组件树/props/本地态/API字段→UI 绑定）。
  - D 功能级数据流转：system-architecture §4 补 会员开通/上下架·售罄拦截/Demo 重置 时序 + §4.7 前后端读写职责速查。

### Changed
- PRD 扩为 v1.1（用户大改）：新增 §1.2/1.3、§2.1/2.2、§14.3 演示剧本 / §14.4 埋点 / §14.5 冻结清单、整个 §15 可执行规格补充（模块地图/功能矩阵/业务流转/数据流转/Admin 字段级规则/状态机/§15.7 跨文档冲突清单 CD-001..010/页面交互详规/后端细则/边界 EDGE-001..025/路由与流转矩阵）、§16 开放问题 OQ-001..005。
- 据 PRD §15.7 同步下游：api-spec（接口索引、Admin 管理接口标题、订单可进详情、Banner targetType/targetCode、Product assetKey/detailText）、system-architecture（P1-P13、React/Web 无 Compose、模块流程合约+深模块）、prototype/README（车主服务 3 项、Admin 六模块非只读）、testing（COPY-001..046、上下架/售罄/Admin/订单详情用例、EDGE/埋点）、roadmap（前端先行图修正）。
- 新增 SPEC-005 车载体验增强（REQ-026/027/028/030/031），REQ-001..042 全覆盖 SPEC-001..005（DRAFT）。
- issues 对齐：关闭 I-004/I-010/I-012；I-009 更新为 SPEC-001..005；新增 I-013（OQ 待确认）。

- `product/` 由六份文件（story-map / user-stories / requirements / data-contracts / copy-bible / source-brief）合并为单一 `prd.md`（ADR-0005）。
- 全局交叉引用统一改指 `product/prd.md` 章节锚点（0 断链）。
- `CLAUDE.md` SSOT 指针更新为 PRD §10/§11；新增 R5–R9 强制纪律。
- 技术栈确定为 **Web-first，前期先做前端**（ADR-0004 Accepted）；R5/R9/pre-commit 命令统一为 `pnpm lint && pnpm test`（Vitest/Playwright）；roadmap 调整为「前端先行」（Phase 3 前端 / Phase 4 后端+Admin）。
- 需求讨论确认 4 项并写入 PRD/SPEC：购物车同 SKU 合并数量（REQ-007）、会员全局单一互斥（REQ-009/033、§10.7）、SKU 不影响价格（§10.1）、失效文案仅兜底不触发（REQ-012）。
- 视觉方向改为**深色座舱（Dark Cockpit）**，取代蓝白液态玻璃（ADR-0007）：更新 design-tokens（SSOT 调色板/效果）、PRD §1/§9、CLAUDE、engineering、prototype（tokens.css + p1-home.html）。
- 新增**订单详情页 P13 / REQ-034 / US-024 / F-24 / API-024 / COPY-043-044**（订单中心卡片改为可点进详情）；并写入剩余需求默认项：登出保留数据(REQ-016)、§13 排除会员到期/消息收藏地址管理/搜索历史类目/splash、可达性 P2 演示可选(REQ-028)。
- **需求大补全（ADR-0008）**：Admin 升级为完整管理后台六模块（REQ-023/036-041、§9.5、API-021/022/023/025/026、SPEC-004）；新增上下架机制（REQ-035、published/sortOrder、结算拦截 4009/COPY-045）；后端改为种子数据+前台实时读（system-architecture）；搜索范围收窄为实物+会员排除展示服务（REQ-003）；新增角色副驾乘客、首页语音占位入口(F-25)；§13 不做范围按文档扩充；§13.1 明确 v1 含三端、前端先行。
- PRD §5 扩为**用户旅程地图**（一级目标 + User Map 总图 + 4 角色旅程 + 故事地图三层 + Epic E1–E5 映射 + User Story Tree）；§6.1 增加**关键用户故事 Gherkin 验收准则**（对接 R9.1 Scenario）。
- 视觉**确认深色座舱 + 电青绿**（关闭与「科技蓝」冲突，ADR-0007）；roadmap 修正为 Phase 3 Web 前端先行 / Phase 4 后端+Admin（核心模块先行）。
- 进入设计阶段（Claude.design 工具不可用，改用静态 HTML/CSS）：新增高保真界面 `index.html` 索引 + `p2-category` `p3-detail` `p6-cart` `p7-confirm` `p8-pay` `p9-result`（与 p1-home 构成 A‑01 购买视觉闭环，深色座舱）。
- 对照外部 PRD 架构补缺（不照搬其业务）：PRD §1.0 背景/问题陈述 + §14.1 可量化成功指标（不含性能）；api-spec 加 数据模型实体 + API 版本/分页/鉴权约定；engineering 加 环境变量分层 + 本地端口；system-architecture 加 模块间流程合约 + 深模块；CONTRIBUTING 加 代码命名约定。（风险登记/起手计划/长期愿景 本期不补）
- PRD 自查补缺：副驾身份「已知妥协」(§3.3a)、仅 1280×720 不自适应(§13)、首页区块内容锁定(§10.8 含车主服务=充电/护理/年卡 3 项)、Demo 重置不还原 Admin 编辑(REQ-019)、详情页返回导航(§9.2)、4009 文案映射(§12)；**新增售罄态 REQ-042 + F-27 + COPY-046「已售罄」+ stock 枚举**（售罄=展示但不可买，区别于下架）。

### Removed
- 删除 `product/story-map.md`、`user-stories.md`、`requirements.md`、`data-contracts.md`、`copy-bible.md`、`source-brief.md`（内容并入 PRD）。

### Deprecated
- （暂无）

### Fixed
- （暂无）

### Security
- （暂无）
