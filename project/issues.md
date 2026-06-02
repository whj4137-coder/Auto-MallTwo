# 问题跟踪表

## 格式说明
- 类型：BUG / SPEC（需求不明） / DEBT（技术债） / LAYOUT / W（SSOT 偏差）
- 优先级：P0（阻塞演示）/ P1（影响流程）/ P2（体验问题）/ P3（可延后）
- 状态：OPEN / IN_PROGRESS / RESOLVED / WONT_FIX

| ID | 类型 | 优先级 | 状态 | 描述 | 发现会话 | 解决会话 | 关联需求 |
|----|------|--------|------|------|---------|---------|---------|
| I-001 | SPEC | P2 | RESOLVED | 需求文档原文已并入单一 product/prd.md（原 source-brief 已合并删除，ADR-0005） | S-001 | S-004 | - |
| I-002 | SPEC | P1 | RESOLVED | api-spec 字段标准（ADR-0002 / OQ-003）已随评审冻结确认（2026-05-29） | S-002 | S-033 | - |
| I-003 | SPEC | P2 | RESOLVED | 已二次联网核实：未发现可直接对标的开源 AAOS/车机商城完整 Demo；benchmarking 保持“车机 HMI + headless commerce + 安全门禁”的综合范式归纳，不阻塞验收 | S-003 | S-035 | - |
| I-004 | SPEC | P2 | RESOLVED | 调研补充项 REQ-026..033 已纳入 PRD §7 并入 SPEC-003/005 覆盖 | S-003 | S-016 | REQ-026..033 |
| I-005 | SPEC | P1 | RESOLVED | 技术栈定为 Web-first（前期 Web 先做前端），ADR-0004 转 Accepted | S-003 | S-007 | - |
| I-006 | SPEC | P0 | RESOLVED | 栈冲突已消解：R5/R9/pre-commit 统一改 `pnpm lint && pnpm test`、测试 Vitest/Playwright | S-005 | S-007 | - |
| I-007 | DEBT | P2 | RESOLVED | git init 已完成（4 commits）；提交门禁改用 `.claude/hooks/commit-gate.sh`（跑 verify，等价 pre-commit）；openspec 采用 markdown changes/specs 流程（未用 openspec CLI）。R5/R9.2 实质达成 | S-005 | S-033 | - |
| I-008 | SPEC | P2 | RESOLVED | Admin+上下架已建 SPEC-004（REQ-023/035-041）；车载增强 REQ-026/027/028/030/031 改由计划 SPEC-005 覆盖（见 I-010） | S-006 | S-011 | REQ-023,035-041 |
| I-010 | SPEC | P2 | RESOLVED | 已建 SPEC-005 车载体验增强，覆盖 REQ-026/027/028/030/031（OQ-002） | S-011 | S-016 | REQ-026,027,028,030,031 |
| I-011 | DEBT | P2 | RESOLVED | 范围扩张：Admin 六模块 + 后端 CRUD + 上下架已全部交付（changes 0006/0010）；Phase 4 完成 | S-011 | S-024 | REQ-037/038/039 |
| I-009 | SPEC | P1 | RESOLVED | 五份 SPEC（001..005）已评审冻结转 APPROVED（2026-05-29，REVIEW-CHECKLIST 全通过）；§10/§11 进硬锁 | S-006 | S-031 | SPEC-001..005 |
| I-012 | SPEC | P1 | RESOLVED | 跨文档冲突 CD-001..010 已在 PRD §15.7 登记并同步下游（api-spec/system-architecture/prototype/testing/roadmap/openspec） | S-016 | S-016 | - |
| I-013 | SPEC | P2 | RESOLVED | PRD §16 开放问题已评审定夺：OQ-001 Admin 范围=六模块+账号信息(0006)；OQ-004 原型=已实现；OQ-005 冻结日期=2026-05-29。详见 REVIEW-CHECKLIST | S-016 | S-031 | - |
| I-014 | W | P1 | RESOLVED | 首页 v7 与 §10.8 差异已走 change 0001 评审冻结：PRD §10.8/§9.3/§10/首页聚合 已更新为新布局，0001→Accepted | S-017 | S-031 | REQ-001 |
| I-015 | DEBT | P2 | OPEN | 本机 3000 端口被一个遗留 Python 进程占用；后端按 dev-guide 使用 3001（无实际冲突）。当前沙箱无权限结束该外部进程，需用户在本机清理 | S-019 | - | - |
| I-016 | DEBT | P3 | WONT_FIX | 本仓库已实际采用 npm workspaces + package-lock，脚本/文档/门禁均按 npm 收口；pnpm/corepack 不再作为 1.0.0 必要条件，后续如团队指定再迁移 | S-019 | S-035 | - |
| I-017 | DEBT | P1 | RESOLVED | 自动化测试已落地（change 0009）：L1/L2 并入 npm run verify + commit hook，L3 单独 test:e2e；A-01/A-02/B-01/C-01/D-01/D-02/AUTH-01/SEARCH-01 与门禁矩阵均已固化 | S-019 | S-023 | - |
| I-018 | DEBT | P2 | RESOLVED | 文档/代码 SSOT 一致原仅靠自觉；已加 scripts/check-ssot.mjs + commit hook 强制校验（change 0008），并修全部 7 处硬编码（change 0007） | S-022 | S-022 | - |
| I-019 | DEBT | P2 | RESOLVED | 沙箱限制仅针对 Codex 会话；S-037 在本机普通环境实跑 `npm run verify`（30 测）+ `npm run test:e2e`（9/9，含 LAYOUT-01 1280×720 审计）全绿 | S-035 | S-037 | TC-019 |
| I-020 | DEBT | P2 | RESOLVED | 本机有 Homebrew `openjdk@17` + `android-commandlinetools`（platforms 35/36、build-tools 34/35/36）；S-037 `gradle :app:assembleDebug` 成功产出 debug APK，工具链验证通过；新增 android-webview/.gitignore | S-036 | S-037 | - |
| I-021 | BUG | P1 | RESOLVED | 实物 checkout 可重复支付：`POST /pay` 仅会员幂等，实物二次支付再次 `nextP()` 生成第二单 + 序号膨胀（违反 EDGE-013/§12.1）。S-038 加 `c.paid` 守卫→4009 `ALREADY_PAID`，补 L2 用例；纳入 openspec change 0012 | S-038 | S-038 | EDGE-013 / change 0012 |
| I-022 | W | P2 | RESOLVED | 后端门禁优先级与 PRD §8 相反：写路由 `requireAuth,gateWrite` 顺序使「未登录+行车/断网」返 1001 而非 2001/2002。S-038 改 `gateWrite,requireAuth`，补 L2 优先级用例；纳入 openspec change 0012 | S-038 | S-038 | REQ-024 / change 0012 |
| I-023 | W | P3 | RESOLVED | 搜索空 `q` 返回 `[]` 而非 §15.10.2 要求的 4000。S-038 后端兜底返回 4000（前端已空输入短路），补 L2 用例；纳入 openspec change 0012 | S-038 | S-038 | REQ-003 / change 0012 |
| I-024 | DEBT | P2 | RESOLVED | CHANGELOG 损坏：WebView 内容滞留 [Unreleased] 但已在 v1.0.0 tag；[1.0.0] 段有多个重复 `### Added/### Changed`（违反 Keep a Changelog/R8）。S-038 重整：折叠进 1.0.0、每组单标题、新 [Unreleased] 记 bug 修复 | S-034 | S-038 | - |
| I-025 | DEBT | P3 | RESOLVED | Android `network_security_config.xml` 改 `base-config cleartextTrafficPermitted="false"`（公网强制 HTTPS），仅 localhost/127.0.0.1/10.0.2.2 经 domain-config 放行明文供本地/模拟器调试。APK 重建编译通过 | S-038 | S-039 | - |
| I-026 | DEBT | P3 | RESOLVED | CORS 由全开收窄为 localhost/127.0.0.1 任意端口白名单（dev :5173→:3001）；生产单服务同源不受影响。Live 校验：dev origin 放行、evil.com 无 ACAO、无 Origin 请求 200 | S-038 | S-039 | - |
| I-027 | DEBT | P3 | RESOLVED | 冗余清理（S-039）：删除死脚手架 `.pre-commit-config.yaml`（过时 pnpm/未init 假设，真门禁=commit-gate.sh）+ 更新 INDEX 引用；修正 tech-stack/build-variants pnpm 滞后文档 | S-039 | S-039 | - |
| I-028 | DEBT | P3 | WONT_FIX | 经评审决定保留：①copy.ts 5 个未用 SSOT 镜像常量（C007/C008/C037/C038、ERR 5000）——是 PRD §11/§12 完整镜像，删除需走 openspec 改契约，收益微小；②1280×664 免滚动布局规格在 CLAUDE§8/prototype/build-variants 三处重复——低风险，暂不收敛 | S-039 | S-039 | - |
| I-029 | W | P2 | RESOLVED | EDGE-005 行为偏离（change 0014 落地时发现）：CART 来源 checkout 按"加购时快照价"定价，Admin 改价后不对进行中的 CART 结算重定价；PRD §15.12 EDGE-005 期望按新价（BUY_NOW 路径读实时价，两路径不一致）。用户决策「改代码对齐 PRD」：S-043 走 [change 0015]，CART 分支改读实时价 `p.priceCents`，两路径口径统一；EDGE-005 L2 补全为"新价结算"+"历史快照不变"两断言（verify 65→66） | S-042 | S-043 | EDGE-005 / REQ-006 / change 0015 |
