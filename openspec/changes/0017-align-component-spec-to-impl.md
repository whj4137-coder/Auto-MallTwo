---
id: 0017
title: 校准 component-spec / frontend-files 至 apps/web 实现（派生文档追平）
status: Accepted
author: Claude
created: 2026-06-02
updated: 2026-06-02
related_milestone: M5
related_issues: []
---

# 0017 · 校准组件清单 / 前端文件蓝图至实现（派生文档追平）

## 1. 动机（Why）
`design/component-spec.md`（组件清单与字段绑定）与 `engineering/frontend-files.md`（前端文件蓝图）是**派生的工程辅助文档**，供前端拆组件、绑数据，**不是 SSOT**（SSOT 为 PRD §10 数据契约 / §11 文案 / design-tokens 视觉）。二者写于实现成型前，与现已冻结、评审通过的 `apps/web` 运行实现存在多处滞后：

- 设想的独立组件（`AppShell`/`ProductCard`/`Stepper`/`PriceText`/`checkoutStore`/`orderStore` 等）与实际不符——实现多为**单组件页 + 语义化 className**，状态集中在 `sessionStore/cartStore/membershipStore/uiStore/adminStore`。
- 字段名为旧设想（`address`/`colorSku`/`items`/`assetKey`），实际取 `packages/shared/src/types.ts`（`receiver`/`color`/`lines`/`lineTotalCents`/`phoneMasked`/`vehicleColor` 等）。
- 路由、Admin 文件结构（`AdminLogin`/`AdminLayout`/`FormModal` 等）、P14 搜索页缺失。
- `frontend-files.md` 仍写 dev 代理端口 `:3000`（实际 `:3001`，见 I-015/dev-guide）。

本 change 把两份派生文档**追平到运行实现**（2026-06-02 按界面校准），便于后续开发参照真实结构。

## 2. 现状（Before）
两份文档描述的组件/字段/路由/端口与 `apps/web` 实现不一致，且 component-spec 缺 P14 搜索页。

## 3. 变更内容（After）
- **design/component-spec.md**：改为「区块（JSX 结构）+ 数据来源 + 绑定/行为」表；字段名一律取 `@apex/shared` 类型；补 P14 搜索页；Admin 段改为真实文件 + FormModal；DemoBar 状态文案补 `CART {n}`。头部声明：本文件以 `apps/web` 实现为准；**若与 PRD §15.9 描述有出入，以运行代码为准，且 §15.9 的同步需走 openspec 提案**（即发现实质行为差异时仍回到 openspec 流程，不在本派生文档里私自改契约）。
- **engineering/frontend-files.md**：dev 代理端口 `:3000`→`:3001`；目录树追平实际文件（`gate.guardWrite`/`money` 元↔分助手/`paths.ts`/`FrontLayout`/`adminStore`/`icons.tsx`；移除不存在的 `DeviceFrame`/`ProductCard`/`Stepper`/`checkoutStore`/`orderStore`）。

**不改**：PRD（§10/§11/§15）、design-tokens、api-spec 契约、`packages/shared`、任何代码与测试。字段名已逐一比对 `types.ts` 确认一致。

## 4. 影响范围（Impact）
- [ ] product/prd.md（不改）
- [ ] design/api-spec.md / design/design-tokens.md（不改）
- [ ] packages/shared、apps/**（不改，0 代码改动）
- [x] design/component-spec.md（派生文档校准）
- [x] engineering/frontend-files.md（派生文档校准）
- [x] openspec README 索引 / project/roadmap.md / sessions（留痕）

## 5. 门禁 / 错误码 影响
无。纯文档。

## 6. 验收标准（Acceptance）
- [x] 两份文档所述组件/字段/路由/端口与 `apps/web` 实现一致；字段名与 `@apex/shared/types.ts` 逐一吻合。
- [x] component-spec 含 P1–P14 + Admin 全部页面。
- [x] 头部明确：本文件派生自实现；与 §15.9 的实质差异仍走 openspec。
- [x] 0 代码 / 0 契约 / 0 SSOT 改动；`npm run verify` 仍 68 全绿。

## 7. 落地步骤
1. 校准两份文档（已在工作区完成，本 change 补留痕）。
2. 比对字段名与 `types.ts` 一致性（已做）。
3. `npm run verify` 确认无回归。
4. 同步 openspec README 索引 / roadmap / session-log，状态置 Accepted。

## 8. 决策记录
无需新 ADR。原则：派生工程文档（非 SSOT）可追平实现；但**实质行为/契约差异（含 PRD §15.9）必须回到 openspec 提案**，不得借派生文档绕过 SSOT。本 change 仅做文档对齐，未触任何契约。
