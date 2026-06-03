---
id: 0022
title: §15.9 交互细节对齐（执行 3/3）
status: Accepted
author: Claude
created: 2026-06-03
updated: 2026-06-03
related_milestone: M5
related_issues: []
---

# 0022 · §15.9 交互细节对齐（执行 3/3）

> 父提案：[0018](0018-reconcile-prd-15-9-with-impl.md)。本 change 执行偏离清单第 3 批（收尾）：**M3·M4·M8·M9·M10·L1·L3·L4·L5·L6·L7**。

## 1. 动机（Why）
0018 审计剩余 11 条交互细节偏离，多为门禁呈现/状态读取/装饰一致性。本 change 收尾，使 §15.9 全部 24 条偏离对齐完成。

## 2. 变更内容（After）
| # | §规则 | 实现 |
|---|-------|------|
| M3 | 登录取消清 PendingAction | `LoginDialog` cancel/× → `takePending()`+关闭 |
| M4 | P1 搜索框门禁分流 | `Home` 搜索框 DRIVING→toast C004 / OFFLINE→C002 / 否则进 /search，置灰态 |
| M8 | P5 灰按钮点击只提示 | `ServiceDetail` 按钮改可点击 → toast C006，不发写入 |
| M9 | P6 行车/断网只读**禁用** | `Cart` 勾选/步进/删除 readonly 时置灰禁用（非 toast 拦截） |
| M10 | P6 下架/售罄标记 | `Cart` 按 `item.published`/`item.stock` 显 C049「已下架」/C046「已售罄」；结算 4009 仍由 env.message（C045/C046）toast |
| L1 | Toast 单条覆盖 | `uiStore.toast` 改为仅保留最新一条 |
| L3 | P2 展示服务价格占位 | `Category` DISPLAY_SERVICE 价格位显「服务展示」 |
| L4 | P4 售罄置灰 | `Membership` soldOut → 主按钮置灰 + C046 |
| L5 | P5 COPY-007/008 | `ServiceDetail` 按类目（cat_charging→C007 / cat_life→C008）显说明 |
| L6 | P10/P13 status 读 o.status | `Orders`/`OrderDetail` 标签改读 `order.status`（ACTIVATED→C033，否则 C032） |
| L7 | P11 会员卡 ACTIVE 详情 | `Mine` 会员卡 ACTIVE 显绑定车辆 + 订单号（取 membershipStore.data） |

**SSOT 增量**：`@apex/shared` COPY `C049_DELISTED_TAG="已下架"` + PRD §11（§15.9.7 购物车下架短标记，§11 此前仅有 C045 长句）。其余复用既有 COPY（C002/004/006/007/008/032/033/046）。

## 3. 影响范围（Impact）
- [x] product/prd.md §11（COPY-049）、packages/shared/src/copy.ts
- [x] apps/web：uiStore / LoginDialog / Home / ServiceDetail / Category / Membership / Mine / Orders / OrderDetail / Cart
- [x] openspec README 索引 / roadmap / session-log（留痕）
- [ ] design/api-spec / 后端（不改）

## 4. 门禁 / 错误码 影响
无新增。门禁判定逻辑不变，仅呈现方式（只读禁用 vs toast）对齐。

## 5. 验收 + Test Plan（通过前置）
- [x] `npm run typecheck` 通过。
- [x] `npm run check:ssot` 通过（C049 经 @apex/shared 引用，0 硬编码）。
- [x] `npm run verify` 68 全绿；`npm run test:e2e` 11/11（D-01/D-02 断网/行车主路径无回归，Cart 只读不影响既有 toast 拦截语义）。
- [ ] 人工：行车进购物车控件置灰、下架项标记、Toast 仅一条、登录取消不续作、ACTIVE 会员卡详情。

## 6. 明确不做（Non-Goals）
- M10 的下架/售罄项**结算拦截**沿用后端 4009 + env.message（C045/C046）toast，不另做前端预校验。
- 不改后端 / API 契约。

## 7. 决策记录
无需新 ADR。至此 0018 的 24 条 §15.9 偏离经 0020/0021/0022 全部对齐，0018 可转 Accepted。
