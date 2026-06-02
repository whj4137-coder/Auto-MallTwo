---
id: 0010
title: Admin 完整 CRUD（商品 / Banner / 服务 新增·编辑表单）
status: Accepted
author: Claude
created: 2026-05-29
updated: 2026-05-29
related_milestone: M4
related_issues: [I-011]
---

# 0010 · Admin 完整 CRUD（已落地）

## 1. 动机（Why）
0006 Admin 仅实现上下架/库存开关与只读查询。SPEC-004（REQ-037/038/039）要求商品/Banner/服务的完整新增·编辑能力。

## 2. 现状（Before）
商品：上下架 + 库存开关；Banner/服务：上下架开关；订单：只读；账号：只读。无新增/改字段表单。

## 3. 变更内容（After）
- 后端 `routes/admin.ts`：
  - 商品 `POST /admin/products`（type 由 category 推导）+ `PATCH /admin/products/:code`（name/priceCents/colors/capacities/sortOrder/homeFeatured）。
  - Banner `POST /admin/banners` + `PATCH /admin/banners/:code`（title/subtitle/targetProductCode/sortOrder，目标须存在）。
  - 服务 `PATCH /admin/services/:code`（会员 name/priceCents/validDays/benefits；展示服务 name/serviceDesc）。
  - 字段校验：失败返 **`ERR.VALIDATION=4000`**（名称空 / 类目不存在 / 价格非正整数 / 跳转目标不存在）。
- 前端 `admin/FormModal.tsx` 通用表单弹窗；AdminProducts/AdminBanners 加「编辑 + 新增」，AdminServices 加「编辑」。
- 删除：**不做硬删**，下架代替（§15.14 删除策略待定）。
- SSOT：新增字面值入后端 store（运营态），不进 §10 锁定；改锁定种子项仅运营态，源码 0 硬编码（check:ssot 仍绿）。

## 4. 影响范围（Impact）
- [x] apps/server admin routes（POST/PATCH）、apps/web admin/FormModal + 三页
- [x] packages/shared errorCodes 加 VALIDATION=4000
- [ ] design/api-spec.md（API-021/022/025 写操作详例待补）；PRD §12 待并入 4000（评审）

## 5. 门禁 / 错误码 影响
写操作需 Admin token（1001）；字段校验失败 **4000**（新增码，待并入 PRD §12）。

## 6. 验收标准（Acceptance）
- [x] 商品/Banner 可新增、商品/Banner/服务可改字段并即时生效前台（浏览器验：改价 ¥139 同步前台、新增「测试脚垫」入列）。
- [x] 校验失败返 4000（L2：空名/坏类目/缺价/负价/坏跳转目标）。
- [x] `npm run verify` 绿（23 测含 5 条 CRUD）。

## 7. 落地步骤
已完成。后续：api-spec 补写操作详例；评审并入 PRD §12 错误码 4000、§15.14 删除策略。

## 8. 决策记录
关联 I-011（范围扩张，已交付）。新增错误码 4000 建议评审并入 PRD §12。
