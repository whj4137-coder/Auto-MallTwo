---
id: 0012
title: 修复重复支付幂等 / 后端门禁优先级 / 搜索空查询（代码对齐已冻结 PRD）
status: Accepted
author: Claude
created: 2026-06-02
updated: 2026-06-02
related_milestone: M5
related_issues: [I-021, I-022, I-023]
---

# 0012 · 重复支付 / 门禁优先级 / 搜索空查询修复（已落地）

## 1. 动机（Why）
S-038 整体审计发现 3 处**代码偏离已冻结 PRD** 的行为缺陷。本变更**不改 PRD/契约本身**，只把代码改成 PRD 本来就规定的样子；但因触及「门禁矩阵解析顺序」与「错误码 4009 的 ALREADY_PAID 原因」，按 openspec 留痕（对应 W/BUG 类 I-021/I-022/I-023）。

## 2. 现状（Before）
- **P1 重复支付**：`POST /checkout/:id/pay`（apps/server/src/routes/checkout.ts）仅对会员做幂等；**实物 checkout 二次支付**会再次 `store.seq.nextP()` 生成第二个 `ORDER-P` 单、序号膨胀。违反 PRD §12.1 / §15.10.5 /状态机「PAID→再次 pay→4009」/ EDGE-013「不生成第二个订单；seq 不递增」。`errorCodes.ts` 的 `ALREADY_PAID` 原因已定义但从未发出。
- **P2 后端门禁优先级**：写路由注册顺序为 `requireAuth, gateWrite`，使「未登录 + 行车/断网」返回 **1001**，与 PRD §8「拦截优先级 DRIVING > OFFLINE > GUEST（同时命中只显最高）」相反。前端 `lib/gate.ts` 顺序正确，仅后端兜底/重放请求暴露。
- **P3 搜索空查询**：`GET /search?q=`（catalog.ts）空查询返回 `[]`，违反 PRD §15.10.2「q 为空返回 4000」。

## 3. 变更内容（After）
| 项 | 旧值 | 新值 |
|----|------|------|
| pay 重复支付（实物） | 无 `c.paid` 检查 → 再次落单、序号 +1 | 支付前判 `c.paid` → `4009`（`data.reason=ALREADY_PAID`），不落单、`seqP` 不变 |
| 写路由中间件顺序（cart×4 + checkout×2） | `requireAuth, gateWrite` | `gateWrite, requireAuth`（DRIVING>OFFLINE>GUEST 成立） |
| /search 空 `q` | 返回 `[]`（200） | 返回 `4000`（前端已对空输入短路，此为后端兜底） |

## 4. 影响范围（Impact）
- [ ] product/prd.md §10 数据契约
- [ ] product/prd.md §11 文案锁定（见 §8 决策记录的擦边说明）
- [ ] product/prd.md 需求清单(§7)/其它章节（行为本就在 §8/§12/§15，不改文档）
- [ ] design/api-spec.md（4009.reason/搜索空查行为已在既有契约内）
- [x] engineering（实现）：checkout.ts、cart.ts、catalog.ts、middleware/gate.ts（注释）
- [x] testing（用例）：apps/server/src/api.test.ts L2 +6 例

## 5. 门禁 / 错误码 影响
- **门禁矩阵**：后端解析顺序由「GUEST 抢先」纠正为 **DRIVING > OFFLINE > GUEST**，与 PRD §8 / REQ-024 一致。`gate.ts` 注释补「写路由必须 `gateWrite, requireAuth` 顺序」约束。
- **错误码**：无新增码。`4009` 启用既有 `reason=ALREADY_PAID`（重复支付）；搜索空查询启用既有 `4000`。

## 6. 验收标准（Acceptance）
- [x] L2：实物 checkout 二次支付 → `4009` + `reason=ALREADY_PAID`，订单仍 1、`seqP` 不变。
- [x] L2：未登录 + 行车 → `2001`；未登录 + 断网 → `2002`（优先级高于 GUEST 1001）。
- [x] L2：空 `q` → `4000`；命中实物（substring）；排除展示服务。
- [x] `npm run verify` 36 绿；`npm run test:e2e` 9 绿（含 LAYOUT-01），无回归（AUTH-01 普通 GUEST 仍 1001、SEARCH-01 UI 未受影响）。
- [x] 落地 commit：`3e6f449`。

## 7. 落地步骤
已完成（S-038 / commit 3e6f449）。无后续。

## 8. 决策记录
- 无新 ADR。关联并解决 I-021（BUG）/I-022（W）/I-023（W）。
- **擦边说明（透明留痕）**：P1/P3 新增 2 条硬编码 toast 文案 `"订单已支付，请勿重复支付"`、`"搜索词不能为空"`，未纳入 §11 COPY。依据：PRD §12.1 明确「重复支付 toast = 错误消息」（未锁定 COPY 常量），且代码已有非 COPY 错误消息先例（checkout.ts:23 `"请先选择商品"`）。如需将其正式纳入 §11，另开独立 openspec change（加 COPY 常量 + 同步 PRD §11 + 改引用）。
