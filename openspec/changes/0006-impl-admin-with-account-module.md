---
id: 0006
title: Admin 后台六模块（含新增「账号信息」只读模块，扩展 SPEC-004）
status: Accepted
author: Claude (impl)
created: 2026-05-29
updated: 2026-05-29
related_milestone: M4
related_issues: [I-011]
---

# 0006 · Admin 后台六模块

## 1. 动机（Why）
实现 SPEC-004 Admin 核心，并按用户评审要求**新增「账号信息」模块**（展示个人/车辆信息），便于运营查看演示账号上下文。

## 2. 现状（Before）
SPEC-004 定义 5 模块：商品/Banner/服务/订单/演示会话（+登录）。无账号信息模块。

## 3. 变更内容（After）
- 后端 `routes/admin.ts`：登录、商品(列表+上下架+库存)、Banner(列表+上下架)、服务内容(列表+上下架)、订单查询、演示会话运行快照。
- 前端 `/admin`：AdminLayout(CATALOG·OPS·**ACCOUNT** 三组导航) + AdminLogin/Products/Banners/Services/Orders/Session/**Account**。
- **新增**：`AdminAccount`（个人信息 + 车辆信息，**只读**，源自 /me，PRD §10.4 固定 Mock）。

| 项 | 旧（SPEC-004） | 新 |
|----|----------------|----|
| Admin 模块数 | 5（商品/Banner/服务/订单/会话） | 6（+ 账号信息 只读） |
| 演示会话 | 含 auth/drive/net | 服务端仅持有 cart/checkout/order/membership/seq；登录/驾驶/网络为各客户端 Demo 态（页面注明） |

## 4. 影响范围（Impact）
- [x] apps/server routes/admin.ts；apps/web admin/*
- [x] design/api-spec.md（API-020/021/022/023/025/026）
- [x] **PRD §15.5/SPEC-004 需补「账号信息」模块**（待评审确认是否纳入正式 SPEC）
- [ ] PRD §10/§11 字面值（无变更，账号信息只读复用 §10.4）

## 5. 门禁 / 错误码 影响
Admin 接口需 Admin token（复用 1001）；账号信息只读，无写入。

## 6. 验收标准（Acceptance）
- [x] 六模块导航齐全，登录后均渲染（浏览器验：商品10/Banner3/服务5/会话8KPI/账号个人+车辆）。
- [x] 商品上下架·库存、Banner/服务上下架即时生效于前台只读接口。
- [ ] 账号信息模块纳入 SPEC-004 正式范围（评审）。

## 7. 落地步骤
代码已完成；**SPEC-004 文档更新待评审冻结**（本 change 为提案载体）。

## 8. 决策记录
新增只读账号模块属 SPEC-004 范围扩展；编辑能力见 0010（Draft）。
