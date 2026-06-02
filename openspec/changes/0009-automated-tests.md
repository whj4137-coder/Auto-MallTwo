---
id: 0009
title: 自动化测试 L1/L2/L3（Vitest / Supertest / Playwright）
status: Accepted
author: Claude
created: 2026-05-29
updated: 2026-05-29
related_milestone: M5
related_issues: [I-017]
---

# 0009 · 自动化测试（已落地）

## 1. 动机（Why）
当前核心闭环仅手动 + 脚本冒烟验证（testing §7），无回归网。R9.3 要求 L1 单测 / L2 集成 / L3 E2E，核心流程 happy path 必须 L3 跑通。

## 2. 现状（Before）
无测试套件；`npm test` 不存在。

## 3. 变更内容（After）
- **L1 Vitest**：`sequencer.test.ts`(订单号规则)、`shelf.test.ts`(上下架可见性)、`money.test.ts`(分→¥) 共 6 例。
- **L2 Supertest**：`apps/server/src/api.test.ts` 共 12 例 —— 信封/home聚合/门禁(1001/2001/2002/2003)/A-01 合并·结算·支付·收货字段/数量上限/B-01 互斥幂等/4009(DELISTED+SOLD_OUT)/Demo 重置。`beforeEach` 调 `store.resetAll()` 隔离。
- **L3 Playwright**(1280×720)：`e2e/shop.e2e.ts` 共 4 例 —— A-01 / B-01 / AUTH-01 / D-01；用点击 SPA 导航（避免 reload 复位内存态）。
- 重构：`apps/server/src/app.ts` 导出 `createApp()`（不 listen）供 supertest；`InMemoryStore.resetAll()` 测试隔离。
- 脚本：`npm test`(vitest run)/`test:watch`/`test:e2e`(playwright)；**L1+L2 并入 `npm run verify` 与 commit hook**；L3 因需起服务+浏览器，单独 `test:e2e`（不入 commit 门禁）。

## 4. 影响范围（Impact）
- [x] apps/server app.ts/api.test.ts、store.resetAll；apps/web/.../*.test.ts；e2e/；vitest.config.ts/playwright.config.ts
- [x] package.json(test/test:e2e/verify)；.claude/hooks（verify 含 test）
- [ ] testing/test-cases.md ↔ 实测对齐（后续逐条映射）

## 5. 门禁 / 错误码 影响
验证既有门禁，不新增。

## 6. 验收标准（Acceptance）
- [x] L1 6 例 + L2 12 例绿（`npm run verify`）；L2 覆盖 1001/2001/2002/2003/4009/重置/幂等。
- [x] L3 4 例绿（`npm run test:e2e`，chromium）覆盖 A-01/B-01/AUTH-01/D-01 happy path。

## 7. 落地步骤
已完成。后续可扩 L3：A-02/C-01/D-02/SEARCH-01 + Admin 上下架→前台实时生效。

## 8. 决策记录
关联 I-017（RESOLVED）。L3 不入 commit 门禁（需服务+浏览器），保持 commit 快。
