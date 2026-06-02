import { Router } from "express";
import { nanoid } from "nanoid";
import type { Product, Banner } from "@apex/shared";
import { ERR, COPY, CATEGORY_TYPE } from "@apex/shared";
import { store } from "../store/InMemoryStore.js";
import { DEMO_PASSWORD, DELIVERY } from "../store/seed.js";
import { ok, fail } from "../middleware/envelope.js";
import { requireAdmin } from "../middleware/auth.js";

export const adminRouter = Router();

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const posInt = (v: unknown) => Number.isInteger(v) && (v as number) > 0;

// API-020 Admin 登录（同演示账号）
adminRouter.post("/admin/login", (req, res) => {
  const { username, password } = req.body ?? {};
  if (username !== store.user.username || password !== DEMO_PASSWORD) {
    fail(res, ERR.BAD_CREDENTIALS, COPY.C003_LOGIN_FAIL);
    return;
  }
  const token = nanoid();
  store.tokens.add(token);
  ok(res, { token });
});

// API-021 Admin 商品管理：列表返回全部（含下架/售罄）
adminRouter.get("/admin/products", requireAdmin, (_req, res) => {
  ok(res, store.products.slice().sort((a, b) => a.sortOrder - b.sortOrder));
});

// 上下架
adminRouter.patch("/admin/products/:code/shelf", requireAdmin, (req, res) => {
  const p = store.getProduct(req.params.code);
  if (!p) {
    fail(res, ERR.NOT_FOUND, COPY.C036_NOT_FOUND);
    return;
  }
  p.published = Boolean(req.body?.published);
  ok(res, p);
});

// 库存（IN_STOCK / SOLD_OUT）
adminRouter.patch("/admin/products/:code/stock", requireAdmin, (req, res) => {
  const p = store.getProduct(req.params.code);
  if (!p) {
    fail(res, ERR.NOT_FOUND, COPY.C036_NOT_FOUND);
    return;
  }
  const stock = req.body?.stock === "SOLD_OUT" ? "SOLD_OUT" : "IN_STOCK";
  p.stock = stock;
  ok(res, p);
});

// API-023 Admin 订单查询（全部）
adminRouter.get("/admin/orders", requireAdmin, (_req, res) => {
  ok(res, store.orders);
});

// API-022 Admin Banner 管理：列表 + 上下架
adminRouter.get("/admin/banners", requireAdmin, (_req, res) => {
  ok(res, store.banners.slice().sort((a, b) => a.sortOrder - b.sortOrder));
});
adminRouter.patch("/admin/banners/:code/shelf", requireAdmin, (req, res) => {
  const b = store.banners.find((x) => x.bannerCode === req.params.code);
  if (!b) { fail(res, ERR.NOT_FOUND, COPY.C036_NOT_FOUND); return; }
  b.published = Boolean(req.body?.published);
  ok(res, b);
});

// API-025 Admin 服务内容（会员 + 展示服务）：列表 + 上下架
adminRouter.get("/admin/services", requireAdmin, (_req, res) => {
  const services = store.products.filter((p) => p.type === "MEMBERSHIP" || p.type === "DISPLAY_SERVICE");
  ok(res, services);
});
adminRouter.patch("/admin/services/:code/shelf", requireAdmin, (req, res) => {
  const p = store.getProduct(req.params.code);
  if (!p || (p.type !== "MEMBERSHIP" && p.type !== "DISPLAY_SERVICE")) {
    fail(res, ERR.NOT_FOUND, COPY.C036_NOT_FOUND); return;
  }
  p.published = Boolean(req.body?.published);
  ok(res, p);
});

// ===== change 0010 · 完整 CRUD（新增 / 改字段；删除走下架，不做硬删，见 §15.14）=====

// 新增商品（type 由 category 推导；校验 §15.5）
adminRouter.post("/admin/products", requireAdmin, (req, res) => {
  const b = req.body ?? {};
  const name = str(b.name);
  const category = str(b.category);
  if (!name) { fail(res, ERR.VALIDATION, "名称不能为空"); return; }
  const type = CATEGORY_TYPE[category];
  if (!type) { fail(res, ERR.VALIDATION, "类目不存在"); return; }
  const isPriced = type === "PHYSICAL" || type === "MEMBERSHIP";
  if (isPriced && !posInt(b.priceCents)) { fail(res, ERR.VALIDATION, "价格须为正整数（分）"); return; }
  const code = str(b.productCode) || `${type === "MEMBERSHIP" ? "mem" : type === "DISPLAY_SERVICE" ? "svc" : "phy"}_${nanoid(6)}`;
  if (store.getProduct(code)) { fail(res, ERR.VALIDATION, "商品编码已存在"); return; }
  const p: Product = {
    productCode: code, category, type, name,
    priceCents: isPriced ? b.priceCents : null,
    colors: Array.isArray(b.colors) ? b.colors.map(str).filter(Boolean) : [],
    capacities: Array.isArray(b.capacities) ? b.capacities.map(str).filter(Boolean) : [],
    homeFeatured: Boolean(b.homeFeatured),
    published: true, sortOrder: Number(b.sortOrder) || (store.products.filter((x) => x.category === category).length + 1),
    stock: "IN_STOCK",
    deliveryNote: type === "PHYSICAL" ? DELIVERY : undefined,
    validDays: type === "MEMBERSHIP" ? Number(b.validDays) || 30 : undefined,
    benefits: type === "MEMBERSHIP" && Array.isArray(b.benefits) ? b.benefits.map(str).filter(Boolean) : undefined,
    boundVehicle: type === "MEMBERSHIP" ? store.user.vehicle : undefined,
    serviceDesc: type === "DISPLAY_SERVICE" ? str(b.serviceDesc) : undefined,
  };
  store.products.push(p);
  ok(res, p);
});

// 改商品字段
adminRouter.patch("/admin/products/:code", requireAdmin, (req, res) => {
  const p = store.getProduct(req.params.code);
  if (!p) { fail(res, ERR.NOT_FOUND, COPY.C036_NOT_FOUND); return; }
  const b = req.body ?? {};
  if (b.name !== undefined) { if (!str(b.name)) { fail(res, ERR.VALIDATION, "名称不能为空"); return; } p.name = str(b.name); }
  if (b.priceCents !== undefined) {
    if (p.type !== "DISPLAY_SERVICE" && !posInt(b.priceCents)) { fail(res, ERR.VALIDATION, "价格须为正整数（分）"); return; }
    p.priceCents = p.type === "DISPLAY_SERVICE" ? null : b.priceCents;
  }
  if (Array.isArray(b.colors)) p.colors = b.colors.map(str).filter(Boolean);
  if (Array.isArray(b.capacities)) p.capacities = b.capacities.map(str).filter(Boolean);
  if (b.sortOrder !== undefined) p.sortOrder = Number(b.sortOrder) || p.sortOrder;
  if (b.homeFeatured !== undefined) p.homeFeatured = Boolean(b.homeFeatured);
  ok(res, p);
});

// 新增 Banner
adminRouter.post("/admin/banners", requireAdmin, (req, res) => {
  const b = req.body ?? {};
  const title = str(b.title);
  const target = str(b.targetProductCode);
  if (!title) { fail(res, ERR.VALIDATION, "标题不能为空"); return; }
  if (!store.getProduct(target)) { fail(res, ERR.VALIDATION, "跳转目标商品不存在"); return; }
  const banner: Banner = {
    bannerCode: str(b.bannerCode) || `banner_${nanoid(6)}`,
    title, subtitle: str(b.subtitle), targetProductCode: target,
    published: true, sortOrder: Number(b.sortOrder) || store.banners.length + 1,
  };
  store.banners.push(banner);
  ok(res, banner);
});

// 改 Banner 字段
adminRouter.patch("/admin/banners/:code", requireAdmin, (req, res) => {
  const banner = store.banners.find((x) => x.bannerCode === req.params.code);
  if (!banner) { fail(res, ERR.NOT_FOUND, COPY.C036_NOT_FOUND); return; }
  const b = req.body ?? {};
  if (b.title !== undefined) { if (!str(b.title)) { fail(res, ERR.VALIDATION, "标题不能为空"); return; } banner.title = str(b.title); }
  if (b.subtitle !== undefined) banner.subtitle = str(b.subtitle);
  if (b.targetProductCode !== undefined) {
    if (!store.getProduct(str(b.targetProductCode))) { fail(res, ERR.VALIDATION, "跳转目标商品不存在"); return; }
    banner.targetProductCode = str(b.targetProductCode);
  }
  if (b.sortOrder !== undefined) banner.sortOrder = Number(b.sortOrder) || banner.sortOrder;
  ok(res, banner);
});

// 改服务内容字段（会员：名称/价格/有效期/权益；展示服务：名称/说明）
adminRouter.patch("/admin/services/:code", requireAdmin, (req, res) => {
  const p = store.getProduct(req.params.code);
  if (!p || (p.type !== "MEMBERSHIP" && p.type !== "DISPLAY_SERVICE")) { fail(res, ERR.NOT_FOUND, COPY.C036_NOT_FOUND); return; }
  const b = req.body ?? {};
  if (b.name !== undefined) { if (!str(b.name)) { fail(res, ERR.VALIDATION, "名称不能为空"); return; } p.name = str(b.name); }
  if (p.type === "MEMBERSHIP") {
    if (b.priceCents !== undefined) { if (!posInt(b.priceCents)) { fail(res, ERR.VALIDATION, "价格须为正整数（分）"); return; } p.priceCents = b.priceCents; }
    if (b.validDays !== undefined) p.validDays = Number(b.validDays) || p.validDays;
    if (Array.isArray(b.benefits)) p.benefits = b.benefits.map(str).filter(Boolean);
  }
  if (p.type === "DISPLAY_SERVICE" && b.serviceDesc !== undefined) p.serviceDesc = str(b.serviceDesc);
  ok(res, p);
});

// API-026 Admin 演示会话：服务端运行快照（登录/驾驶/网络为各客户端 Demo 态，服务端不持有）
adminRouter.get("/admin/session", requireAdmin, (_req, res) => {
  ok(res, {
    cartCount: store.cart.reduce((s, i) => s + i.qty, 0),
    cartSelected: store.cart.filter((i) => i.selected).length,
    checkoutCount: store.checkouts.size,
    orderCount: store.orders.length,
    membership: store.membership.status,
    seq: store.seq.snapshot(),
  });
});
