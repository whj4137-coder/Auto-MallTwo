---
id: 0021
title: P9 刷新恢复 + orderNo 兜底 + 写入按钮防重复点击（§15.9 对齐执行 2/3）
status: Accepted
author: Claude
created: 2026-06-03
updated: 2026-06-03
related_milestone: M5
related_issues: []
---

# 0021 · P9 刷新恢复 + 防重点击（§15.9 对齐执行 2/3）

> 父提案：[0018](0018-reconcile-prd-15-9-with-impl.md)。本 change 执行偏离清单第 2 批：**H3·M12·M2**。

## 1. 动机（Why）
- **H3**：P9 支付结果页 `Result.tsx` 仅读 router `location.state`，刷新即丢失变空白；§15.9.10 要求"刷新可按 orderNo 调 API-024"。
- **M12**：orderNo 查不到时无 COPY-036 兜底。
- **M2**：写入按钮（GatedButton / Pay）无防重复点击，连点可重复发请求；§15.9.1/15.9.9 要求"按钮防重复点击直到返回"。

## 2. 现状（Before）
- `App.tsx` 路由 `result`（无参）；`Pay.tsx` `nav("/result",{state:{order,type}})`；`Result.tsx` 只读 state。
- `GatedButton.tsx` onClick 立即 `guardWrite(action)`，无 pending 锁。

## 3. 变更内容（After）
1. **路由**：`result` → `result/:orderNo`（`App.tsx`）。
2. **Pay.tsx**：成功后 `nav(\`/result/\${order.orderNo}\`,{state})`，仍带 state 走快路径。
3. **Result.tsx**：用 `useLoad` 按 `orderNo` 调 API-024 兜底——有 `state.order` 用之（快），否则拉取；4004→notfound（COPY-036 + 返回首页，M12）；loading→骨架。
4. **防重点击（M2）**：`guardWrite` 返回 action 结果；`GatedButton` 维护 `pending`，action 返回 Promise 时置灰禁用直至 settle。覆盖加购/立即购买/开通/结算/支付/购物车增删改等全部 GatedButton 写操作。

**不改**：PRD / SSOT / `@apex/shared` / 后端。纯前端行为；复用既有 COPY-036。**0 SSOT 改动**（commit-gate 闸门 A 不触发）。

## 4. 影响范围（Impact）
- [x] apps/web/src/App.tsx（result 路由加 :orderNo）
- [x] apps/web/src/pages/{Result,Pay}.tsx
- [x] apps/web/src/lib/gate.ts（guardWrite 返回结果）
- [x] apps/web/src/components/gate/GatedButton.tsx（pending 锁）
- [x] openspec README 索引 / roadmap / session-log（留痕）
- [ ] product/prd.md / packages/shared（不改）

## 5. 门禁 / 错误码 影响
无新增。复用 4004→COPY-036；门禁判定逻辑不变。

## 6. 验收 + Test Plan（通过前置）
- [x] `npm run typecheck` 通过。
- [x] `npm run verify` 68 全绿（不改后端/测试）。
- [x] `npm run test:e2e` 11/11——A-01/B-01 支付落地后跳 `/result/<orderNo>` 仍正常；**新增 REFRESH-01**：结果页 reload（复位 GUEST + 丢 state）→ 按 orderNo 调 API-024 → 1001 弹登录 → 登录后订单重现（锁 H3/M12）。
- [ ] 人工：连点支付按钮只落一单（防重 M2，GatedButton pending 锁；后端 ALREADY_PAID 兜底已有 L2）。

## 7. 明确不做（Non-Goals）
- 交互细节（搜索门禁分流、购物车只读禁用、status 读取等）→ 留 0022。
- 不改 API-024 契约；不引入乐观锁（防重为前端 UI 锁，后端 ALREADY_PAID 仍是权威兜底）。

## 8. 备选方案与取舍
- result 带 orderNo 路由 vs 保留 query state：选路由参数（刷新可恢复，URL 可分享）。
- 防重放 GatedButton 统一处理 vs 各页自管：选统一（一处覆盖所有写按钮）。

## 9. 未决问题（Unresolved）
- 无。
