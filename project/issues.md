# 问题跟踪表

## 格式说明
- 类型：BUG / SPEC（需求不明） / DEBT（技术债） / LAYOUT / W（SSOT 偏差）
- 优先级：P0（阻塞演示）/ P1（影响流程）/ P2（体验问题）/ P3（可延后）
- 状态：OPEN / IN_PROGRESS / RESOLVED / WONT_FIX

| ID | 类型 | 优先级 | 状态 | 描述 | 发现会话 | 解决会话 | 关联需求 |
|----|------|--------|------|------|---------|---------|---------|
| I-001 | SPEC | P2 | RESOLVED | 需求文档原文已并入单一 product/prd.md（原 source-brief 已合并删除，ADR-0005） | S-001 | S-004 | - |
| I-002 | SPEC | P1 | OPEN | api-spec 字段标准沿用 ADR-0002（对应 PRD §16 OQ-003，待冻结确认） | S-002 | - | - |
| I-003 | SPEC | P2 | OPEN | 联网检索工具不可用，benchmarking 调研为综合归纳；工具恢复后二次核实开源车机商城范式 | S-003 | - | - |
| I-004 | SPEC | P2 | RESOLVED | 调研补充项 REQ-026..033 已纳入 PRD §7 并入 SPEC-003/005 覆盖 | S-003 | S-016 | REQ-026..033 |
| I-005 | SPEC | P1 | RESOLVED | 技术栈定为 Web-first（前期 Web 先做前端），ADR-0004 转 Accepted | S-003 | S-007 | - |
| I-006 | SPEC | P0 | RESOLVED | 栈冲突已消解：R5/R9/pre-commit 统一改 `pnpm lint && pnpm test`、测试 Vitest/Playwright | S-005 | S-007 | - |
| I-007 | DEBT | P1 | OPEN | 仓库未 git init、未 openspec init、pre-commit 未启用；R5/R9.2 暂以 `Verified: openspec-not-initialized` 兜底，需尽快初始化 | S-005 | - | - |
| I-008 | SPEC | P2 | RESOLVED | Admin+上下架已建 SPEC-004（REQ-023/035-041）；车载增强 REQ-026/027/028/030/031 改由计划 SPEC-005 覆盖（见 I-010） | S-006 | S-011 | REQ-023,035-041 |
| I-010 | SPEC | P2 | RESOLVED | 已建 SPEC-005 车载体验增强，覆盖 REQ-026/027/028/030/031（OQ-002） | S-011 | S-016 | REQ-026,027,028,030,031 |
| I-011 | DEBT | P2 | RESOLVED | 范围扩张：Admin 六模块 + 后端 CRUD + 上下架已全部交付（changes 0006/0010）；Phase 4 完成 | S-011 | S-024 | REQ-037/038/039 |
| I-009 | SPEC | P1 | RESOLVED | 五份 SPEC（001..005）已评审冻结转 APPROVED（2026-05-29，REVIEW-CHECKLIST 全通过）；§10/§11 进硬锁 | S-006 | S-031 | SPEC-001..005 |
| I-012 | SPEC | P1 | RESOLVED | 跨文档冲突 CD-001..010 已在 PRD §15.7 登记并同步下游（api-spec/system-architecture/prototype/testing/roadmap/openspec） | S-016 | S-016 | - |
| I-013 | SPEC | P2 | RESOLVED | PRD §16 开放问题已评审定夺：OQ-001 Admin 范围=六模块+账号信息(0006)；OQ-004 原型=已实现；OQ-005 冻结日期=2026-05-29。详见 REVIEW-CHECKLIST | S-016 | S-031 | - |
| I-014 | W | P1 | RESOLVED | 首页 v7 与 §10.8 差异已走 change 0001 评审冻结：PRD §10.8/§9.3/§10/首页聚合 已更新为新布局，0001→Accepted | S-017 | S-031 | REQ-001 |
| I-015 | DEBT | P2 | OPEN | 本机 3000 端口被一个遗留 python http.server(PID 外部) 占用；后端按 dev-guide 用 3001（与文档一致，无实际冲突），但提醒清理该遗留进程 | S-019 | - | - |
| I-016 | DEBT | P3 | OPEN | 环境未装 pnpm/corepack，改用 npm workspaces（功能等价，ADR-0004 偏差）；如需严格对齐 pnpm 后续 `npm i -g pnpm` 再迁移 lockfile | S-019 | - | - |
| I-017 | DEBT | P1 | RESOLVED | 自动化测试已落地（change 0009）：L1 Vitest 6 + L2 Supertest 12 + L3 Playwright 4，全绿；L1/L2 并入 npm run verify + commit hook，L3 单独 test:e2e。待扩 A-02/C-01/D-02/SEARCH-01 | S-019 | S-023 | - |
| I-018 | DEBT | P2 | RESOLVED | 文档/代码 SSOT 一致原仅靠自觉；已加 scripts/check-ssot.mjs + commit hook 强制校验（change 0008），并修全部 7 处硬编码（change 0007） | S-022 | S-022 | - |
