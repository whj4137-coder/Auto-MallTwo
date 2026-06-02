---
id: 0016
title: Checkout 校验 SKU 仍合法（代码对齐冻结 PRD §15.10.4 / EDGE-006）
status: Accepted
author: Claude
created: 2026-06-02
updated: 2026-06-02
related_milestone: M5
related_issues: []
---

# 0016 · Checkout 校验 SKU 仍合法（代码对齐冻结 PRD）

## 1. 动机（Why）
整体审计（S-044）发现：PRD §15.10.4 把「**SKU 仍合法**」列为 CART/PHYSICAL 与 BUY_NOW/PHYSICAL 的创建校验项，§15.12 **EDGE-006**（「SKU 被 Admin 删除 → 创建 checkout → 返回 4000 或 4004，前台提示 COPY-036」）。但实现只校验 `published`/`stock`，**未校验所选 color/capacity 是否仍属于该商品的 SKU 数组**。

可触发：Admin 可经 `PATCH /admin/products/:code` 整体替换 `colors`/`capacities` 数组（[admin.ts:127](../../apps/server/src/routes/admin.ts)）。若购物车里某项的 SKU 颜色/容量被 Admin 改没，结算时会生成**带失效 SKU 的 checkout** 而非按契约报错。change 0014 当初把 EDGE-006 判为「无硬删 N/A」，遗漏了「Admin 改 SKU 数组」这条可达路径。

本 change **让代码回归到已冻结约定**（同 change 0012/0015 性质），PRD 不改。

## 2. 现状（Before）
- CART 分支（[checkout.ts](../../apps/server/src/routes/checkout.ts)）：循环内只判 `!p.published` / `SOLD_OUT`，随后直接用购物车快照 color/capacity 组行。
- BUY_NOW 分支：传入的 `color`/`capacity` 未与 `p.colors`/`p.capacities` 比对，非法值被 `?? p.colors[0]` 之外的显式传入直接采纳。

## 3. 变更内容（After）
- **CART 分支**：每个选中项校验 `i.color ∈ p.colors && i.capacity ∈ p.capacities`，否则 `4004 NOT_FOUND` + `COPY.C036`（`data.reason=SKU_INVALID`）。语义：购物车里"该项"已找不到对应 SKU，提示刷新/移除。
- **BUY_NOW 分支**：显式传入的 `color`/`capacity` 若不属于该商品 → `4000 VALIDATION` + `COPY.C036`（`data.reason=SKU_INVALID`）。语义：请求参数非法。未传入时仍回落 `p.colors[0]`，不变。
- 两个错误码均落在 PRD EDGE-006「4000 或 4004」允许区间内，按"快照失效=4004 / 入参非法=4000"区分。

| 项 | 旧值 | 新值 |
|----|------|------|
| CART checkout SKU 校验 | 无 | color/capacity∈商品数组，否则 4004 |
| BUY_NOW checkout SKU 校验 | 无 | 显式传入非法 → 4000 |
| L2 用例数（api.test.ts） | 59 | 61 |
| `npm run verify` 总测数 | 66 | 68 |

## 4. 影响范围（Impact）
- [ ] product/prd.md（不改，代码对齐既有约定）
- [ ] design/api-spec.md（不改）
- [x] apps/server/src/routes/checkout.ts（CART + BUY_NOW 增 SKU 校验）
- [x] apps/server/src/api.test.ts（EDGE-006 两用例）
- [x] testing/coverage-matrix.md（EDGE-006 由 N/A 转已覆盖）、test-strategy.md（计数）
- [x] CHANGELOG / sessions / openspec README 索引

## 5. 门禁 / 错误码 影响
不新增错误码。复用 4000/4004 + COPY-036，新增 `data.reason=SKU_INVALID` 供前端区分提示。

## 6. 验收标准（Acceptance）
- [x] CART 来源：购物车 SKU 被 Admin 改没 → 结算 `4004`（reason SKU_INVALID）。
- [x] BUY_NOW：传入非法 color/capacity → `4000`（reason SKU_INVALID）。
- [x] 合法 SKU / 不传 SKU 的既有路径不受影响（A-01/A-02 等仍绿）。
- [x] `npm run verify` 全绿（总测 66→68，L2 59→61）。
- [x] 不触 SSOT/契约/文案锁定值。

## 7. 落地步骤
1. checkout.ts CART + BUY_NOW 增 SKU 合法性校验。
2. 补 api.test.ts EDGE-006 两用例。
3. `npm run verify` 复跑确认 68 绿。
4. 同步 coverage-matrix（EDGE-006 转覆盖）/ test-strategy 计数 / CHANGELOG / session-log / openspec README 索引，状态置 Accepted。

## 8. 决策记录
无需新 ADR。沿用「代码偏离已冻结 PRD → 对齐契约，不改契约」原则（同 change 0012/0015）。错误码选择（CART 4004 / BUY_NOW 4000）均在 EDGE-006 允许区间内，按"快照失效 vs 入参非法"语义区分。
