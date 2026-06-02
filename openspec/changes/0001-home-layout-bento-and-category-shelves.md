---
id: 0001
title: 首页改版 — Bento + 类目条 + 精选横滑 rail + 分类货架（展示全部商品）
status: Draft            # Draft | In Review | Accepted | Rejected | Superseded
author: Claude (design phase)
created: 2026-05-29
updated: 2026-05-29
related_milestone: M1
related_issues: [I-014]
---

# 0001 · 首页改版 — Bento + 类目条 + 精选横滑 rail + 分类货架

## 1. 动机（Why）
高保真设计阶段（深色座舱 v7，ADR-0007）落地的 P1 首页信息密度高于 PRD §10.8 旧锁定的「精选 3 + 车主服务 3」。
用户在设计评审中明确要求：在 v4（Bento + 类目条）基础上，于「类目条」和底部之间**新增「精选商品」横向大卡 rail（可左右滑动）**，并将底部列表从「精选 3 + 服务 3」改为**按类目分区的货架（车品/电子/会员/充电/生活），每区列出该类全部商品**。
这与 §10.8 字面锁定不一致，按硬约护栏（§2.1 SSOT、R6）须先走 openspec 提案，评审冻结后再改 PRD 与代码，不得静默覆盖。

## 2. 现状（Before）
PRD §10.8「首页区块内容锁定」：

| 区块 | 内容 |
|------|------|
| HERO Banner | banner_001 → phy_car_001 |
| 快捷类目（5） | 车品 / 电子配件 / 会员服务 / 充电服务 / 生活服务 |
| 精选商品（3） | phy_car_001 / phy_ele_001 / mem_001（homeFeatured ✅） |
| 车主服务（3） | svc_charge_001 / svc_life_001 / mem_002 |

> 均仅「已上架」展示，下架不补位。
> 关联：§9.3 P1 规则（HERO+Grid，精选3+车主服务3）、§10「homeFeatured 前 3」、首页聚合接口（featured 前 3 + services 三项）。

## 3. 变更内容（After）
首页区块改为四段（自上而下）：

| 项 | 旧值 | 新值 |
|----|------|------|
| 布局形态 | HERO+Grid | Bento（HERO + 2 promo）+ 类目条 + 精选横滑 rail + 分类货架 |
| 顶部主推 | HERO Banner 单块 | Bento：左 HERO(banner_001→phy_car_001) + 右上 promo(便捷充电) + 右下 promo(会员服务) |
| 类目条 | 快捷类目 5（无数量） | 快捷类目 5，每项带该类商品数量 |
| 精选商品 | Grid 静态 3（homeFeatured 前 3） | 横向大卡 rail（scroll-snap，可滑动），取 homeFeatured=true 且 published=true，按 sortOrder，**不限 3 个** |
| 底部 | 车主服务 Grid 3（§10.8 锁定项） | 分类货架：按 5 类目分区，每区列出该类**全部 published=true 商品**（含展示服务，仅浏览） |

> 「车主服务 3 锁定」语义并入「会员/充电/生活」三个货架分区，不再单列固定 3 项。

## 4. 影响范围（Impact）
- [x] product/prd.md §10 数据契约（§10.8 首页锁定、homeFeatured「前 3」上限）
- [ ] product/prd.md §11 文案锁定（promo 文案若新增需补 COPY）
- [x] product/prd.md 需求清单/其它章节（§9.3 P1 规则、§5.x、§15 页面交互表、首页聚合接口、EDGE-017、CD-006）
- [x] design/api-spec.md（首页聚合 featured 去掉「前 3」、新增分类货架返回结构）
- [ ] design/design-tokens.md（已含 bento/rail 视觉，无需改值）
- [x] design/prototype/（p1-home.html 已落地；README P1 段已更新）
- [ ] engineering/（实现：P1 容器与 store）
- [ ] testing/（用例：首页聚合 / 货架渲染 / rail 滑动）
- [ ] 其他：____

## 5. 门禁 / 错误码 影响
无。首页为只读浏览，不触发写入门禁；展示服务货架点进仍走 P5（写入返回 2003，不变）。

## 6. 验收标准（Acceptance）
1. P1 自上而下渲染：Bento(HERO+2 promo) → 类目条(5，带数量) → 精选 rail(可横向滑动) → 分类货架(5 分区)。
2. 精选 rail 内容 = homeFeatured=true 且 published=true，按 sortOrder，数量不被截断为 3。
3. 分类货架每区 = 该类目 published=true 商品全集（含展示服务，标「暂未开放」）。
4. 顶部 Bento + 类目条 + rail 首屏（1280×664）可见；分类货架在主内容内部滚动（符合 §2.4 例外）。
5. 下架商品不在对应区出现；售罄商品仍展示并带 COPY-046 标签。

## 7. 落地步骤
1. 更新真值文档：PRD §10.8 表、§9.3 P1 规则、§10 homeFeatured 描述、首页聚合接口、§15 P1 交互行、EDGE-017、CD-006、api-spec 首页聚合。
2. 改代码：P1 容器（Bento/类目条/rail/货架四段）+ 首页聚合 store/接口。
3. 改/加测试：首页聚合 L1（featured 不截断、货架按类目全集）、L3 happy path 进入首页渲染、L4 截图。

## 8. 决策记录
关联 ADR-0007（深色座舱）与 ADR-0008（v1 范围扩张）；本变更为其下的首页信息密度细化，**单独不另开 ADR**，以本 change(0001) 作为决策载体。评审 Accepted 后归档并在 CHANGELOG [Unreleased] 记一行（R8）。
