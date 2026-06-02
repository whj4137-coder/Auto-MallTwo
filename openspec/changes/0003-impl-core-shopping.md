---
id: 0003
title: 核心购物闭环 A-01/A-02（实物）+ 展示服务 2003 + 下架/售罄 4009
status: Accepted
author: Claude (impl)
created: 2026-05-29
updated: 2026-05-29
related_milestone: M3
related_issues: []
---

# 0003 · 核心购物闭环（实物）

## 1. 动机（Why）
实现 SPEC-001 的实物购物主线：浏览 → 加购/立即购买 → 购物车 → 确认 → 模拟支付 → 订单。

## 2. 现状（Before）
0002 底座就位，无业务路由/页面。

## 3. 变更内容（After）
- 后端 `routes/catalog.ts`(home/categories/products/search)、`cart.ts`、`checkout.ts`、`orders.ts`；服务 `shelf.ts`、`sequencer.ts`。
- 加购合并同 SKU、数量 [1,5]；Checkout 后端重算金额；支付 `pay` 落单 `ORDER-P-NNN`、删已勾选项。
- 展示服务写入恒返 **2003**；含下架/售罄项结算返 **4009**(reason DELISTED/SOLD_OUT)。
- 前端页面 P1/P2/P3/P5/P6/P7/P8/P9/P10/P13 + ProductCard/Stepper/money。

## 4. 影响范围（Impact）
- [x] apps/server routes/services；apps/web pages
- [x] design/api-spec.md（API-001..016/024，已标实现状态）
- [ ] PRD/文案（无变更，引用 §10/§11）

## 5. 门禁 / 错误码 影响
2003（DISPLAY_SERVICE 写入）、4009（下架/售罄结算）已实现并验证。

## 6. 验收标准（Acceptance）
- [x] A-01：加购¥129×2 → CART → 支付 → ORDER-P-001 已支付（curl+浏览器双验）。
- [x] A-02：立即购买 BUY_NOW 不触购物车。
- [x] 展示服务强制加购 → 2003。

## 7. 落地步骤
已完成（CHANGELOG / testing §7）。

## 8. 决策记录
路由按职责合并实现（catalog 合并 home/categories/products/search），不另开 ADR。
