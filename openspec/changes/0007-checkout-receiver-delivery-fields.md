---
id: 0007
title: Checkout 注入 receiver / deliveryNote（后端权威，api 契约变更）
status: Accepted
author: Claude (impl)
created: 2026-05-29
updated: 2026-05-29
related_milestone: M4
related_issues: [I-018]
---

# 0007 · Checkout 收货/配送后端权威字段

## 1. 动机（Why）
确认页 P7 原前端硬编码收货人/地址/配送说明（§10.4 字面值），违反"前端不重抄 SSOT"。根因：Checkout 契约未携带这些字段，前端只能硬编码。修根因 = 后端把字段塞进 Checkout。

## 2. 现状（Before）
`Checkout = {checkoutId,source,type,lines,totalCents,paid}`；P7 硬编码 "张先生 / 上海… / 预计 2-3 个工作日送达（演示）"。

## 3. 变更内容（After）
- `@apex/shared` `Checkout` 增 `receiver?:{name,phone,address}` 与 `deliveryNote?:string`（仅实物）。
- 后端创建 Checkout 时：PHYSICAL 注入 `store.user.receiver` 与首商品 `deliveryNote`；MEMBERSHIP 留空。
- 前端 P7 改渲染 `c.receiver`/`c.deliveryNote`；P6 收货人取 `/me`。

| 项 | 旧 | 新 |
|----|----|----|
| Checkout 字段 | 无收货/配送 | + receiver / deliveryNote（实物） |
| P7 收货信息 | 硬编码 §10.4 | 后端字段渲染 |

## 4. 影响范围（Impact）
- [x] packages/shared types.ts；apps/server checkout.ts；apps/web Confirm/Cart
- [x] design/api-spec.md（API-013/014 响应增字段，待补正文示例）
- [ ] PRD（无业务变更，仅契约承载）

## 5. 门禁 / 错误码 影响
无。

## 6. 验收标准（Acceptance）
- [x] 实物 Checkout 返回 receiver+deliveryNote；会员为空（curl 验）。
- [x] `npm run check:ssot` 0 重复（P7/P6 不再硬编码 §10.4）。

## 7. 落地步骤
已完成。api-spec API-013/014 响应示例待补字段。

## 8. 决策记录
关联 0008 的 SSOT 校验（本变更由其暴露）；I-018 记录 check:ssot 引入。
