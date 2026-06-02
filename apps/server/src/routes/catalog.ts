import { Router } from "express";
import type { HomeData } from "@apex/shared";
import { ERR, COPY } from "@apex/shared";
import { store } from "../store/InMemoryStore.js";
import { visibleProducts } from "../services/shelf.js";
import { ok, fail } from "../middleware/envelope.js";

export const catalogRouter = Router();

// API-001 首页聚合（仅 published）。布局见 openspec change 0001。
catalogRouter.get("/home", (_req, res) => {
  const visible = visibleProducts(store.products);
  const banners = store.banners.filter((b) => b.published).sort((a, b) => a.sortOrder - b.sortOrder);
  const categories = store.categories
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((c) => ({ ...c, count: visible.filter((p) => p.category === c.categoryCode).length }));
  const featured = visible.filter((p) => p.homeFeatured);
  const shelves = store.categories
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((category) => ({
      category,
      products: visible.filter((p) => p.category === category.categoryCode),
    }));
  const data: HomeData = { banners, categories, featured, shelves };
  ok(res, data);
});

// API-002 类目列表
catalogRouter.get("/categories", (_req, res) => {
  ok(res, store.categories.slice().sort((a, b) => a.sortOrder - b.sortOrder));
});

// API-003 类目下商品（仅 published）
catalogRouter.get("/categories/:categoryCode/products", (req, res) => {
  const cat = store.categories.find((c) => c.categoryCode === req.params.categoryCode);
  if (!cat) {
    fail(res, ERR.NOT_FOUND, COPY.C036_NOT_FOUND);
    return;
  }
  const products = visibleProducts(store.products).filter((p) => p.category === cat.categoryCode);
  ok(res, { category: cat, products });
});

// API-004 商品详情（含售罄；下架返回 4004）
catalogRouter.get("/products/:productCode", (req, res) => {
  const p = store.getProduct(req.params.productCode);
  if (!p || !p.published) {
    fail(res, ERR.NOT_FOUND, COPY.C036_NOT_FOUND);
    return;
  }
  ok(res, p);
});

// API-005 搜索（名称 substring；仅可购买商品=实物+会员；仅 published）
catalogRouter.get("/search", (req, res) => {
  const q = String(req.query.q ?? "").trim();
  const results = q
    ? visibleProducts(store.products).filter(
        (p) => p.type !== "DISPLAY_SERVICE" && p.name.includes(q),
      )
    : [];
  ok(res, results);
});
