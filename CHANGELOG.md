# Changelog

本文件记录项目所有值得注意的变更。
格式遵循 [Keep a Changelog 1.1.0](https://keepachangelog.com/zh-CN/1.1.0/)，版本遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

分组（六类）：Added / Changed / Deprecated / Removed / Fixed / Security。

> 维护规则（R8）：OpenSpec change 归档时必须在 `[Unreleased]` 同步加一行；发版时把 `[Unreleased]` 改为 `[X.Y.Z] — YYYY-MM-DD`，并在顶部新开空的 `[Unreleased]`。每个版本每个分组只保留一个标题（不要重复 `### Added`）。详见 [CLAUDE.md](CLAUDE.md) R8。

## [Unreleased]

> 本组修复纳入 openspec [change 0012](openspec/changes/0012-fix-pay-idempotency-and-gate-order.md)（代码对齐已冻结 PRD，不改契约；关联 I-021/I-022/I-023）。

### Added
- **L3 跨端联动 E2E `ADMIN-01`**：在 `/admin` UI 真实点击「下架/上架」→ 前台首页 UI 实时反映（商品消失/恢复），补齐"三端联动"此前仅 L2(API)覆盖、无真实点击 E2E 的缺口；自带还原避免污染共享态。E2E 由 9 → **10**。

### Fixed
- **重复支付拦截（EDGE-013 / §12.1）**：`POST /checkout/:id/pay` 此前仅对会员幂等，实物 checkout 二次支付会再次落单并使 `ORDER-P` 序号递增。改为支付前判 `c.paid`，已支付直接返回 `4009`（`data.reason=ALREADY_PAID`），不再生成第二单或递增序号。补 L2 用例。
- **后端门禁优先级（PRD §8）**：写路由原注册顺序为 `requireAuth, gateWrite`，导致「未登录+行车/断网」并发时先返回 `1001` 而非更高优先级的 `2001/2002`。改为 `gateWrite, requireAuth`，使 `DRIVING > OFFLINE > GUEST` 在后端兜底也成立。补 L2 优先级用例。
- **搜索空查询**：`GET /search?q=` 空查询此前返回 `[]`，按 §15.10.2 改为返回 `4000`（前端已对空输入短路，此为后端兜底）。补 L2 用例。

## [1.0.0] — 2026-06-02

### Added
- **WebView APK + 公网部署交付准备**：新增 Android WebView 横屏壳 `android-webview/`（构建时注入公网 URL）、Docker 单服务部署、Express 生产模式托管前台静态包，以及 `docs/deployment/WEBVIEW_PUBLIC_DEPLOY.md` 交付指南。
- **LAYOUT-01 布局审计用例（M-F）**：新增 1280×720 关键页面 E2E 审计，覆盖前台关键页、登录后购物车、Admin 六模块，断言无横向溢出、非列表页无整页纵向溢出。
- **演示脚本 `testing/demo-script.md`（M-F）**：5–10 分钟评审演示流程（A-01/B-01/门禁/Admin 联动/搜索/重置）。
- **门禁矩阵 L2（M-B）**：补 checkout/pay/会员/改量 × GUEST·DRIVING·OFFLINE 用例。P0/P1 issues 清零（关 I-002/I-007）。
- **搜索独立页 `/search`（M-C）**：商品名 substring，仅实物+会员、仅 published；行车/断网禁用 + 语音占位（COPY-004）；空结果 COPY-014 + COPY-015 返回推荐。首页搜索框由重定向 /category 改为进 /search。
- **测试扩充（M-B）**：E2E 增 A-02/C-01/D-02/SEARCH-01；L2 增 Admin 下架·改价→前台只读实时与门禁矩阵补充。api-spec 补实现增量（image/Checkout 字段/Admin 写操作/搜索）。
- **可交互全栈实现（核心闭环）**：monorepo（npm workspaces）落地 `apps/web`（Vite+React+TS+Zustand+React Router，前台 `/` + Admin `/admin`，复用 ui.css）、`apps/server`（Express+InMemoryStore，:3001，种子=§10）、`packages/shared`（类型/错误码/COPY 文案 SSOT 镜像）。
  - 后端 API-001..019 + Admin API-020/021/023/024；统一信封 `{code,message,data}`；双层门禁（auth 1001 / gate 2001·2002 / DISPLAY_SERVICE 2003）；OrderSequencer P/M；Demo 重置仅清会话数据。
  - 前台核心闭环 P1–P13 + LoginDialog；GateGuard + pending-action 续作；Admin A0 登录 / A1 商品（上下架·库存开关）/ A4 订单。
- **Admin 完整 CRUD（change 0010）**：后端商品/Banner `POST` 新增 + 商品/Banner/服务 `PATCH` 改字段，字段校验返 `ERR.VALIDATION=4000`；前端 `admin/FormModal` 通用表单 + AdminProducts/AdminBanners「编辑·新增」、AdminServices「编辑」。删除走下架（不做硬删）。
- **Admin 六模块补全**：前端 AdminBanners(API-022)/AdminServices(API-025)/AdminSession(API-026)/AdminAccount(个人+车辆只读，§10.4) + 后端对应端点；左导航 CATALOG·OPS·ACCOUNT。
- **商品图（change 0011）**：新增 `Product.image` 字段 + seed 挂载 + `ProductMedia`（img + 图标兜底）接入 P2 大卡/首页/P3；图片为代码生成的座舱风矢量 SVG（`scripts/gen-product-images.mjs` → `apps/web/public/products/{code}.svg`）。真照片可外部生成后同名覆盖。
- **自动化测试落地（change 0009）**：L1 Vitest（sequencer/shelf/money）+ L2 Supertest（`apps/server/src/api.test.ts`：信封/门禁/A-01/B-01/4009/重置）+ L3 Playwright（`e2e/shop.e2e.ts`，1280×720）。重构 `app.ts`(createApp 供 supertest)、`InMemoryStore.resetAll()`(测试隔离)。L1/L2 并入 `npm run verify` + commit hook，L3 单独跑。
- **OpenSpec 切片化**：实现按能力拆为 changes 0002–0010；openspec/README 加变更提案索引，roadmap 重切为「Phase 现状 + 切片视图」，HANDOFF 升级为多-change 总览。
- **CLAUDE 驱动的提交门禁 hook**：`.claude/settings.json`(PreToolUse:Bash) → `.claude/hooks/commit-gate.sh`，拦截真正的 `git commit`：先跑 `npm run verify`，不过则 exit 2 阻断；`--no-verify` 直接阻断。
- **SSOT 字面值校验** `scripts/check-ssot.mjs`（`npm run check:ssot`）：以 copy.ts(§11)+seed.ts(§10) 为镜像真值扫描源码，发现完整字符串/JSX 文本重复 SSOT 即报错。已接入 `npm run verify` 与提交门禁 hook。
- 后端 Checkout 注入 `receiver`/`deliveryNote`（仅实物，后端权威），前台 Confirm 直接渲染。
- 前/后端文件汇总蓝图 `engineering/frontend-files.md`、`backend-files.md`；预览服务器脚本 `.claude/preview-server.js`。
- 高保真静态稿全量收口（深色座舱 v7）：共享设计系统 `design/prototype/ui.css`，前台 P1–P13 + 后台 A0–A5 共 19 页，`index.html` 全部可点。
- 「可直接编码」契约层：api-spec 接口契约详例（API-001..026）、`engineering/frontend-spec.md`、`design/component-spec.md`、system-architecture §4 时序 + 读写职责速查。
- 文档治理体系：`README.md`、`INDEX.md`、`CLAUDE.md`、`CONTRIBUTING.md`；单一产品需求文档 `product/prd.md`（§4 功能 / §5 旅程 / §6 故事 / §7 REQ / §10 数据契约★ / §11 文案★ / §12 错误码 / §14 验收）。
- 设计文档 `design/`（benchmarking/system-architecture/api-spec/design-tokens★/prototype）；工程文档 `engineering/`（tech-stack/dev-guide/build-variants）；测试文档 `testing/`（test-strategy/test-cases/coverage-matrix）。
- 项目管理 `project/`（roadmap/issues/decisions ADR-0001..0009）；变更提案 `openspec/`（README + changes + specs SPEC-001..005 + HANDOFF）；会话交接 `sessions/`。

### Changed
- **评审冻结（2026-05-29，ADR-0009）**：REVIEW-CHECKLIST 全通过 → changes 0001/0006/0007/0010/0011 → Accepted；SPEC-001..005 → APPROVED；PRD §10/§11 进入硬锁。§10.8 首页改新布局（Bento+类目条+精选 rail+分类货架，取代 精选3+服务3）、§10.1 加 image 字段；SPEC-004 纳入账号信息只读模块。关 I-009/I-013/I-014。
- **需求大补全（ADR-0008）**：Admin 升级为完整管理后台六模块；新增上下架机制（published/sortOrder、结算拦截 4009/COPY-045）；后端改种子数据+前台实时读；搜索范围收窄为实物+会员排除展示服务；新增副驾乘客角色、首页语音占位入口（F-25）；新增售罄态 REQ-042/F-27/COPY-046 + stock 枚举。
- **PRD 扩为 v1.1**：新增整个 §15 可执行规格（模块地图/功能矩阵/业务·数据流转/Admin 字段级规则/状态机/§15.7 跨文档冲突 CD-001..010/边界 EDGE-001..025/路由矩阵）+ §16 开放问题；据 §15.7 同步下游 api-spec/system-architecture/prototype/testing/roadmap；新增 SPEC-005 车载体验增强（REQ-026..031）。
- 视觉方向定为**深色座舱（Dark Cockpit）+ 电青绿**（ADR-0007）：design-tokens（SSOT 调色板/效果）v7 实际取值同步，PRD §1/§9、CLAUDE、engineering、prototype 对齐。
- 技术栈定为 **Web-first，前期先做前端**（ADR-0004）；roadmap 调整为前端先行（Phase 3 前端 / Phase 4 后端+Admin）。
- `product/` 六份文件合并为单一 `prd.md`（ADR-0005）；全局交叉引用统一改指 PRD 章节锚点（0 断链）；CLAUDE SSOT 指针更新为 §10/§11，新增 R5–R9 强制纪律。
- 需求确认并写入 PRD/SPEC：购物车同 SKU 合并、会员全局单一互斥、SKU 不影响价格、失效文案仅兜底；新增订单详情页 P13（REQ-034）；§5 扩为用户旅程地图 + §6.1 Gherkin。
- P2 分类页右侧改大商品卡（2 列）；`dev-guide` 运行命令改 npm workspaces；api-spec/system-architecture 增「实现状态」段；CLAUDE.md 重构为规范结构；根 `package.json` 加 `typecheck` 脚本。
- 对照外部 PRD 架构补缺：PRD §1.0 背景 + §14.1 成功指标；api-spec 加数据模型/版本/分页/鉴权；engineering 加环境变量分层/端口；system-architecture 加模块流程合约/深模块。

### Removed
- 清理 P1 设计探索过程稿 `p1-home-v2..v7.html` 与旧 `tokens.css`（被 ui.css 取代）。
- 删除 `product/story-map.md`、`user-stories.md`、`requirements.md`、`data-contracts.md`、`copy-bible.md`、`source-brief.md`（内容并入 PRD）。

### Fixed
- **首页 Banner 失效目标过滤**：`/api/home` 过滤目标商品已下架的 Banner，避免 Admin 下架主推商品后首页 Hero 留存但无法跳转或价格缺失。
- **首页主 Banner 价格同步**：主推 CTA 去除硬编码 `¥129`，改为按 Banner 目标商品实时渲染。
- **Admin 价格编辑口径**：商品/服务表单改为输入「元」，提交时自动转 `priceCents`，避免按元填写后前台显示 `¥0`。
- **冻结后 SSOT 自相矛盾修复（审计）**：§10.8 改新布局后残留的旧「精选3+服务3」描述（§15.9.2/§15.15/EDGE-017/首页聚合行/api-spec API-001）全部对齐 change 0001；搜索路由更新为已实现 `/search`；frontend-files/system-architecture 补 Search/ProductMedia/FormModal/AdminAccount。
- commit-gate hook 漏判 `git -c … commit` / `git --no-pager commit`（门禁被静默绕过）→改为双条件判定，容忍中间 flag，3 态复测通过。
- 清除前台硬编码 §10/§11 字面值：Confirm 收货信息改用后端 checkout 字段、Cart 取 `/me`，cartStore/Mine/AdminProducts/AdminOrders 改引用 `COPY.*`；check:ssot 0 重复。

### Deprecated
- （暂无）

### Security
- （暂无）
</content>
</invoke>
