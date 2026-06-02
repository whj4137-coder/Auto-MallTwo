---
id: 0011
title: 商品图（Product.image 字段）+ 代码生成矢量 SVG 插画
status: Accepted
author: Claude (impl)
created: 2026-05-29
updated: 2026-05-29
related_milestone: M-C
related_issues: []
---

# 0011 · 商品插画 + image 字段

## 1. 动机（Why）
用户要「商品图」。本环境无照片级文生图、pencil 已否决；选定方案=**代码生成矢量插画**（座舱风，每商品独特）。同时把 §10「图片 assetKey 来源」开放问题落地为 `image` 字段。

## 2. 现状（Before）
商品无图片字段；前端各处用类型图标（typeVisual）占位。

## 3. 变更内容（After）
- `scripts/gen-product-images.mjs` 生成 10 张 `apps/web/public/products/{code}.svg`（深色渐变 + 网格 + 角标 + 独特线稿 + mono 编码标签；按类型配色 teal/violet/teal-mem/amber）。
- `@apex/shared` `Product` 增 **`image?: string`**；seed 为每个种子商品挂 `/products/{code}.svg`。
- 前端 `components/ProductMedia`（有 image 渲 `<img cover>`，否则回退类型图标）接入 P2 大卡、首页精选 rail + 分类货架小卡、P3 详情大图。
- Admin 新增商品暂无 image → 自动回退图标（不报错）。

| 项 | 旧 | 新 |
|----|----|----|
| Product 字段 | 无 image | + `image?`（§10 schema 增字段，非破坏） |
| 商品视觉 | 类型图标 | SVG 插画（缺省回退图标） |

## 4. 影响范围（Impact）
- [x] packages/shared types；apps/server seed；apps/web ProductMedia + Home/Category/ProductDetail
- [x] apps/web/public/products/*.svg（10）；scripts/gen-product-images.mjs
- [ ] PRD §10：image 字段 + 「图片来源=代码生成 SVG，真照片可替换」（评审并入）

## 5. 门禁 / 错误码 影响
无。

## 6. 验收标准（Acceptance）
- [x] 10 SVG 生成且 :5173/products/*.svg 200；API 返回 image。
- [x] P2/首页/P3 渲染插画，缺 image 回退图标；`npm run verify` 23 测绿。

## 7. 落地步骤
已完成。后续：真照片可放 `public/products/` 同名覆盖，或 Admin 加 image 字段编辑（并入 0010 后续）。

## 8. 决策记录
- 路径几经反复：① 代码生成 SVG 矢量插画 → ② 用户「不要矢量图」→ ③ 选「网上找免版权图」用 loremflickr 下载 JPEG → ④ 用户「不要这个抓取数据源，换回矢量图/直接 ai 生图」。
- 本环境**无照片级 diffusion 文生图**、pencil 经用户否决，「直接 ai 生图」生成不了真实照片；故按用户备选采用**代码生成矢量 SVG**（`scripts/gen-product-images.mjs`，10 张，每商品独特线稿）。已删除 loremflickr JPEG 与抓取脚本。
- 真照片如需：外部生成后同名覆盖 `public/products/{code}.svg`（或改 ProductMedia 支持 .png/.jpg）。
