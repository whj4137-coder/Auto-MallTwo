---
id: 0013
title: 补充自动化测试用例（覆盖空白端点 / 边界行为）
status: Accepted
author: Claude
created: 2026-06-02
updated: 2026-06-02
related_milestone: M5
related_issues: []
---

# 0013 · 补充自动化测试用例（已落地）

## 1. 动机（Why）
0009/0012 + S-041 把核心闭环、门禁优先级、跨端联动织成了回归网，但逐端点比对发现仍有一批**已实现却无自动化断言**的接口与边界行为（属"纯补测试"，不改 WHAT、不改对外行为，按 openspec README「纯实现/无契约变更」本可免提案；用户强制要求统一走 openspec 留痕，故立此 change）。空白处一旦回归（如有人误删 `requireAdmin` 或改坏 1002 文案）现网无任何用例拦截。

## 2. 现状（Before）
L2 `apps/server/src/api.test.ts` 共 29 例，覆盖信封/home/门禁(1001/2001/2002/2003)/A-01/B-01/4009/Admin CRUD/重复支付/搜索/重置。逐路由核对后，以下**已实现端点/行为无任何 L2 断言**：

- 鉴权：`POST /auth/login` 错误密码 1002、`POST /auth/logout` 清 token、`GET /me`。
- 订单/会员只读：`GET /orders/:orderNo`（命中 + 4004）、`GET /membership`（INACTIVE→ACTIVE）、`GET /orders` 未登录 1001。
- 目录 4004：`GET /products/:code` 下架/不存在、`GET /categories`、`GET /categories/:code/products` 类目不存在。
- 购物车：`DELETE /cart/:itemId`、`PATCH /cart/:itemId/select`、改量边界钳制 [1,5]、改/删不存在项 4004。
- A-02：BUY_NOW 实物**购物车不变量**仅 L3 覆盖，无 L2 断言。
- Admin：`requireAdmin` 对 GUEST 返 1001、`POST /admin/login`（正确/错误）、`GET /admin/session` 快照字段、`PATCH /admin/banners/:code/shelf`、`PATCH /admin/services/:code/shelf`（含非服务码 4004）。

## 3. 变更内容（After）
仅在 `apps/server/src/api.test.ts` **追加** describe 块，断言上述空白端点的真实行为；不新建产品代码、不改契约/文案/SSOT。

| 项 | 旧值 | 新值 |
|----|------|------|
| L2 用例数（api.test.ts） | 29 | 48 |
| `npm run verify` 总测数（L1 7 + L2） | 36 | 55 |

## 4. 影响范围（Impact）
- [ ] product/prd.md §10 数据契约
- [ ] product/prd.md §11 文案锁定
- [ ] design/api-spec.md
- [ ] design/design-tokens.md
- [x] testing/（coverage-matrix 缺口清单、test-strategy §7 计数）
- [x] apps/server/src/api.test.ts（仅追加用例）
- [x] CHANGELOG / sessions / openspec README 索引

## 5. 门禁 / 错误码 影响
不新增门禁或错误码。补测既有 1001/1002/2001/4004 在新覆盖端点上的行为。

## 6. 验收标准（Acceptance）
- [x] `npm run verify` 全绿，L2 由 29 增至 48、总测 36→55。
- [x] 新增用例覆盖：1002 文案、logout 后写入 1001、/me、订单详情命中+4004、/membership 状态机、目录 4004、购物车删除/勾选/改量边界、A-02 不变量、requireAdmin 拒绝 GUEST、admin/session 字段、banner/service 上下架。
- [x] 无产品代码改动（git diff 仅测试 + 文档）。

## 7. 落地步骤
1. 追加 L2 用例至 `apps/server/src/api.test.ts`。
2. 更新 testing/coverage-matrix.md 缺口清单、test-strategy.md §7 计数。
3. `npm run verify` 复跑确认 54 绿。
4. 同步 CHANGELOG / session-log / HANDOFF / openspec README 索引，状态置 Accepted。

## 8. 决策记录
无需新 ADR。沿用 0009 决策：L3 不入 commit 门禁；本 change 仅扩 L1/L2（入 verify）。
