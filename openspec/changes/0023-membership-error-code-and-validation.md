---
id: 0023
title: 会员加购错误码 + checkout 创建校验时机对齐 PRD（I-030 / I-031）
status: Accepted
author: Claude
created: 2026-06-03
updated: 2026-06-03
related_milestone: M5
related_issues: [I-030, I-031]
---

# 0023 · 会员错误码 + 校验时机对齐 PRD（I-030 / I-031）

## 1. 动机（Why）
S-044 整体审计登记的两条 W 类偏离，用户决策"代码对齐 PRD"（同 0012/0015/0016 性质，PRD 不改）：

- **I-030**：`POST /cart` 对 MEMBERSHIP 返回 `2003 SCOPE_BLOCKED`，但 PRD §15.10.3 期望 `4000`（仅 DISPLAY_SERVICE 应 2003）。
- **I-031**：PRD §15.10.4 要求 BUY_NOW/MEMBERSHIP 创建 checkout 时校验 `membership=INACTIVE`；实现把幂等推迟到支付步，创建时不校验。

两者前台均无触发入口（会员无加购按钮；P4 ACTIVE 显"已开通"不创建 checkout），属后端口径对齐。

## 2. 变更内容（After）
- **cart.ts（I-030）**：加购分支拆分——`MEMBERSHIP → 4000 VALIDATION`，`DISPLAY_SERVICE → 2003 SCOPE_BLOCKED`（文案沿用 C039）。
- **checkout.ts（I-031）**：BUY_NOW 分支在确定 `type=MEMBERSHIP` 后，若 `store.membership.status==="ACTIVE"` → `4000 VALIDATION`（复用 COPY-023「已开通」，不新增 SSOT）；支付步幂等保留为纵深防御。
- **测试**：更新 B-01「互斥幂等」用例——已 ACTIVE 再开通在**创建步**即返 4000（原断言移到创建）；新增 2 条 L2（会员加购 4000 / 展示服务 2003；会员 checkout INACTIVE 放行·ACTIVE 拒 4000）。

| 项 | 旧 | 新 |
|----|----|----|
| 会员加购错误码 | 2003 | 4000 |
| 会员 checkout 创建（ACTIVE） | 放行，幂等推迟到支付 | 创建即 4000 |
| L2 用例数 | 61 | 63 |
| verify 总测 | 68 | 70 |

## 3. 影响范围（Impact）
- [x] apps/server/src/routes/cart.ts、checkout.ts
- [x] apps/server/src/api.test.ts（B-01 更新 + 2 新用例）
- [x] project/issues.md（关 I-030/I-031）、openspec README 索引 / roadmap / session-log
- [ ] product/prd.md / packages/shared（**不改**——代码对齐既有 §15.10.3/15.10.4；复用 C023/C039，0 SSOT 改动，闸门 A 不触发）

## 4. 门禁 / 错误码 影响
复用既有 4000/2003。会员路径错误码与 PRD §15.10.3/15.10.4 对齐；门禁矩阵不变。

## 5. 验收 + Test Plan（通过前置）
- [x] `npm run verify` 70 全绿（L2 61→63）。
- [x] `npm run test:e2e` 11/11（B-01 首次开通流程不受影响）。
- [x] 会员加购→4000、展示服务加购→2003、会员 checkout ACTIVE→4000、INACTIVE 放行 各有断言。
- [x] 不触 SSOT/契约/文案锁定值。

## 6. 明确不做（Non-Goals）
- 不改 PRD §15.10.3/15.10.4（代码回归既有约定）。
- 不引入新 COPY（复用 C023「已开通」/ C039）。

## 7. 决策记录
无需新 ADR。沿用"代码偏离已冻结 PRD → 对齐契约"原则。至此 S-044 审计登记的 I-030/I-031 收口，issues 无 W 类 OPEN。
