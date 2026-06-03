---
id: 0020
title: 前台加载/错误/空态/重试基座（§15.9 对齐执行 1/3）
status: Accepted
author: Claude
created: 2026-06-03
updated: 2026-06-03
related_milestone: M5
related_issues: []
---

# 0020 · 前台加载/错误/空态/重试基座（§15.9 对齐执行 1/3）

> 父提案：[0018](0018-reconcile-prd-15-9-with-impl.md)（PRD §15.9 ↔ 实现核对，用户决策"全量对齐"）。本 change 执行其偏离清单的第 1 批。
> 编号说明：原拟 0019，因并发会话已占用 0019（工程纪律强化），本 change 改用 0020（编号不复用）。

## 1. 动机（Why）
0018 审计发现 §15.9.1 全局框架与各页存在一批**加载/异常态缺失**偏离（断网白屏、5000 静默、加载失败恒"加载中…"、4004/空态无界面、GUEST 进订单不弹登录），主路径正常但稳健性不足。本 change 补齐这批基座，覆盖偏离 **H1·H2·H4·M1·M5·M6·M7·M13·L2**。

## 2. 现状（Before）
- `lib/http.ts` fetch 无 try/catch → 断网抛未捕获 rejection，全站无 COPY-038（H1）。
- 各页 `api.x().then(env=>env.code===OK && set(...))`：失败永久"加载中…"，无重试（H2/H4）；5000 静默（M1）；4004 无 COPY-036（M6/M7）；列表空态/类目空态缺失（M5）；Orders 1001 不弹登录（M13）；无骨架（L2）。

## 3. 变更内容（After）
1. **`lib/http.ts`**：fetch 包 try/catch——网络失败 toast COPY-038 + 返回合成信封 `{code:NETWORK_FAIL(-1)}`（避免白屏）；响应 code=5000 集中 toast COPY-037。
2. **`lib/useLoad.ts`（新）**：统一数据钩子，映射 OK/4004(notfound)/1001(弹登录+登录后重载)/其它(error)，返回 `{data,status,reload}`。
3. **`components/PageFallback.tsx`（新）**：三态 UI——骨架(loading) / 错误+重试(COPY-037+COPY-047) / 未找到+返回(COPY-036+COPY-044)。
4. **`styles/ui.css`**：`.skel*` 骨架样式 + `.empty .et` 错误文案。
5. **页面接入**：Home/Category/ProductDetail/Membership/ServiceDetail/Orders/OrderDetail/Mine/Confirm/Pay 改用 useLoad+PageFallback；Category 右栏补 4004/空态(COPY-048)/错误重试；Confirm 失效→COPY-034+返回购物车；Pay 失效→COPY-035+返回。
6. **SSOT 新增**：`@apex/shared` COPY `C047_RETRY="重试"`、`C048_CAT_EMPTY="该分类下暂无可购商品"`，并补入 PRD §11（COPY-047/048）——本 change 唯一的契约/SSOT 改动（§15.9.1/§15.9.3 隐含的 UI 文案此前 §11 缺失）。

## 4. 影响范围（Impact）
- [x] product/prd.md §11（新增 COPY-047/048，§11 镜像）
- [x] packages/shared/src/copy.ts（C047/C048）
- [x] apps/web/src/lib/{http,useLoad}.ts、components/PageFallback.tsx、styles/ui.css
- [x] apps/web/src/pages/{Home,Category,ProductDetail,Membership,ServiceDetail,Orders,OrderDetail,Mine,Confirm,Pay}.tsx
- [x] openspec README 索引 / roadmap / session-log（留痕）
- [ ] design/api-spec / design-tokens（不改）

## 5. 门禁 / 错误码 影响
不新增后端错误码。前端新增客户端合成码 `NETWORK_FAIL=-1`（仅前端短路用，非 §12 契约码）。1001/4004/5000 的前端**呈现**补齐。

## 6. 验收 + Test Plan（通过前置）
- [x] `npm run typecheck` 通过（两端）。
- [x] `npm run check:ssot` 通过（C047/C048 经 @apex/shared 引用，0 硬编码重复）。
- [x] `npm run verify` 68 全绿（后端错误码 4004/5000/1001 的 L2 已覆盖；本 change 不改后端）。
- [x] `npm run test:e2e` 10/10 全绿——主路径（A-01/A-02/B-01/门禁/搜索/LAYOUT/ADMIN）无回归。
- [ ] 人工浏览器验证（断网 toast / 加载失败重试 / 4004 未找到 / 骨架）——建议下次起服务复核（前端态机器可测性弱，见 0018 §4 说明）。

## 7. 明确不做（Non-Goals）
- P9 刷新恢复（H3）、orderNo 查不到 COPY-036（M12）、写入防重点击（M2）→ 留 0021。
- 交互细节（搜索门禁分流 M4、购物车只读禁用 M9、下架/售罄标记 M10、status 读取 L6 等）→ 留 0022。

## 8. 备选方案与取舍
- 错误处理集中在 http 层 vs 各页自理：选 http 层集中（网络/5000 一处兜底），4004/1001 因需页面级呈现差异留在 useLoad/页面。
- 错误态文案：复用 COPY-037/036，仅补 C047/C048 两个 §11 缺失项（最小 SSOT 增量），不发明多余文案。

## 9. 未决问题（Unresolved）
- 骨架屏样式为通用占位，未逐页定制（可接受）。
- 前端态缺机器断言，依赖人工浏览器验证 + typecheck。
