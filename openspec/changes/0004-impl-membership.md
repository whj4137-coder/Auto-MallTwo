---
id: 0004
title: 会员开通 B-01（全局单一 / 月年卡互斥 / 幂等）
status: Accepted
author: Claude (impl)
created: 2026-05-29
updated: 2026-05-29
related_milestone: M3
related_issues: []
---

# 0004 · 会员开通 B-01

## 1. 动机（Why）
实现 SPEC-002：会员不进购物车、直接开通，全局单一、月/年卡互斥、重复开通幂等。

## 2. 现状（Before）
0003 实物闭环就位；会员路径未实现。

## 3. 变更内容（After）
- 后端：会员走 BUY_NOW Checkout(type=MEMBERSHIP)，支付生成 `ORDER-M-NNN`，置 `membership=ACTIVE`（记 orderNo/validDays/boundVehicle）；已 ACTIVE 再支付**不产生新单**（幂等）。
- `routes/orders.ts` GET /membership；前端 `membershipStore` + P4 会员页（未开通→COPY-022 / 已开通→COPY-023 跳订单）。

## 4. 影响范围（Impact）
- [x] apps/server checkout/pay/membership；apps/web Membership.tsx + store
- [x] design/api-spec.md（API-013/015/017）
- [ ] PRD/文案（无变更）

## 5. 门禁 / 错误码 影响
开通受 GateGuard + 后端门禁约束；无新错误码。

## 6. 验收标准（Acceptance）
- [x] B-01：开通 mem_001 → ORDER-M-001 + ACTIVE（curl+浏览器双验）。
- [x] 两张会员卡开通任一后均显 COPY-023；再开通不产生新单。

## 7. 落地步骤
已完成。

## 8. 决策记录
无新 ADR。
