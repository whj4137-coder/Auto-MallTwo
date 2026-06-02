---
id: 0015
title: CART 结算按实时价定价（代码对齐冻结 PRD §15.12 EDGE-005）
status: Accepted
author: Claude
created: 2026-06-02
updated: 2026-06-02
related_milestone: M5
related_issues: [I-029]
---

# 0015 · CART 结算按实时价定价（代码对齐冻结 PRD）

## 1. 动机（Why）
change 0014 落地 EDGE-005 时发现行为偏离（[I-029](../../project/issues.md)）：

- **CART 来源 checkout** 用**加购时快照价** `cartItem.unitPriceCents` 定价（[checkout.ts:42](../../apps/server/src/routes/checkout.ts)），Admin 改价后**不**对进行中的购物车结算重新定价。
- **BUY_NOW 来源 checkout** 读**实时价** `product.priceCents`（[checkout.ts:69](../../apps/server/src/routes/checkout.ts)）。

PRD §15.12 EDGE-005（已冻结）期望：「cart 中已有 phy_ele_001 ¥499 → Admin 改价 ¥599 后结算 → **P7/P8 金额按 ¥599×数量**；历史订单不变」。即两条路径都应按实时价结算。当前 CART 路径偏离契约，且与 BUY_NOW 自相矛盾。

本 change **让代码回归到已冻结约定**（同 change 0012 性质），不改 WHAT、不改契约——PRD §15.12 不动。用户决策为「改代码对齐 PRD」。

## 2. 现状（Before）
`checkout.ts` CART 分支已加载最新商品 `p`（用于下架/售罄校验），但定价仍取购物车快照：
```ts
unitPriceCents: i.unitPriceCents,
lineTotalCents: i.unitPriceCents * i.qty,
```
后果：Admin 改价后，CART 结算页（P7/P8）显示旧价，与 PRD §15.12 EDGE-005 和 BUY_NOW 路径均不一致。

## 3. 变更内容（After）
CART 分支改用循环内已加载的 `p.priceCents`（实时价），与 BUY_NOW 路径一致：
```ts
unitPriceCents: p.priceCents ?? 0,
lineTotalCents: (p.priceCents ?? 0) * i.qty,
```
其余字段（name/color/capacity/qty）仍取购物车选中项的快照——价格随实时、所选 SKU 与数量不变。**历史订单不变**已由落单时 snapshot `c.lines` 保证（[checkout.ts:151](../../apps/server/src/routes/checkout.ts)），无需改动。

同步把 change 0014 EDGE-005 用例的"半边断言"补成完整：改价后 CART checkout 总额按新价 **且** 落单后历史订单快照不变。

| 项 | 旧值 | 新值 |
|----|------|------|
| CART checkout 定价 | 加购快照价 | 实时商品价 |
| L2 用例数（api.test.ts） | 58 | 59（EDGE-005 拆为"新价结算"+"历史快照不变"两断言） |
| `npm run verify` 总测数 | 65 | 66 |

## 4. 影响范围（Impact）
- [ ] product/prd.md §10 数据契约（不改）
- [ ] product/prd.md §11 文案锁定（不改）
- [ ] product/prd.md §15.12 EDGE-005（不改，代码对齐既有约定）
- [ ] design/api-spec.md（不改）
- [x] apps/server/src/routes/checkout.ts（CART 分支定价取实时价）
- [x] apps/server/src/api.test.ts（EDGE-005 补全断言）
- [x] testing/coverage-matrix.md（EDGE-005 由"部分"转"完整"）
- [x] CHANGELOG / sessions / openspec README 索引 / project/issues.md（关 I-029）

## 5. 门禁 / 错误码 影响
不新增。定价仍走后端权威；下架/售罄校验（4009）不变。

## 6. 验收标准（Acceptance）
- [x] CART 来源 checkout 总额按 Admin 改价后的实时价计算（EDGE-005 前半断言）。
- [x] 落单后改价，历史订单 totalCents 快照不变（EDGE-005 后半断言）。
- [x] CART 与 BUY_NOW 两条路径定价口径一致。
- [x] `npm run verify` 全绿（总测 65→66，L2 58→59）。
- [x] 仅改 checkout.ts 定价两行 + 测试 + 文档；不触 SSOT/契约/文案。

## 7. 落地步骤
1. 改 `checkout.ts` CART 分支定价取 `p.priceCents`。
2. 补全 `api.test.ts` EDGE-005 断言（新价结算 + 历史快照不变）。
3. `npm run verify` 复跑确认 65 绿。
4. 关 I-029；同步 CHANGELOG / coverage-matrix / test-strategy / session-log / HANDOFF / openspec README 索引，状态置 Accepted。

## 8. 决策记录
无需新 ADR。沿用「代码偏离已冻结 PRD → 对齐契约，不改契约」原则（同 change 0012）。EDGE-005 选择"实时定价"而非"快照定价"系用户决策，理由：①PRD §15.12 已冻结为实时价；②BUY_NOW 已读实时价，对齐后两路径一致；③历史订单快照不变本已满足，无副作用。
