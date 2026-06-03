import { Router } from "express";
import { nanoid } from "nanoid";
import type { CartItem } from "@apex/shared";
import { ERR, COPY } from "@apex/shared";
import { store } from "../store/InMemoryStore.js";
import { ok, fail } from "../middleware/envelope.js";
import { requireAuth } from "../middleware/auth.js";
import { gateWrite } from "../middleware/gate.js";

export const cartRouter = Router();

const MAX_QTY = 5;

function cartView() {
  const items = store.cart;
  const selectedTotalCents = items
    .filter((i) => i.selected)
    .reduce((s, i) => s + i.unitPriceCents * i.qty, 0);
  return { items, selectedTotalCents };
}

// API-008 查看购物车
cartRouter.get("/cart", requireAuth, (_req, res) => {
  ok(res, cartView());
});

// API-009 加入购物车（仅 PHYSICAL；展示服务→2003；售罄→4009）
cartRouter.post("/cart", gateWrite, requireAuth, (req, res) => {
  const { productCode, color, capacity, qty = 1 } = req.body ?? {};
  const p = store.getProduct(productCode);
  if (!p || !p.published) {
    fail(res, ERR.NOT_FOUND, COPY.C036_NOT_FOUND);
    return;
  }
  // §15.10.3：会员加购 → 4000；展示服务加购 → 2003（C-01 强制写入拦截）。前台均无加购入口。
  if (p.type === "MEMBERSHIP") {
    fail(res, ERR.VALIDATION, COPY.C039_SCOPE);
    return;
  }
  if (p.type !== "PHYSICAL") {
    fail(res, ERR.SCOPE_BLOCKED, COPY.C039_SCOPE);
    return;
  }
  if (p.stock === "SOLD_OUT") {
    fail(res, ERR.NOT_CHECKOUTABLE, COPY.C046_SOLD_OUT, { reason: "SOLD_OUT" });
    return;
  }
  const reqColor = color ?? p.colors[0];
  const reqCap = capacity ?? p.capacities[0];
  const existing = store.cart.find(
    (i) => i.productCode === productCode && i.color === reqColor && i.capacity === reqCap,
  );
  const addQty = Math.max(1, Math.min(MAX_QTY, Number(qty) || 1));
  if (existing) {
    existing.qty = Math.min(MAX_QTY, existing.qty + addQty);
  } else {
    const item: CartItem = {
      itemId: nanoid(8),
      productCode: p.productCode,
      name: p.name,
      type: p.type,
      unitPriceCents: p.priceCents ?? 0,
      qty: addQty,
      color: reqColor,
      capacity: reqCap,
      selected: true,
      published: p.published,
      stock: p.stock,
    };
    store.cart.push(item);
  }
  ok(res, { ...cartView(), message: COPY.C005_ADDED });
});

// API-010 修改数量 [1,5]
cartRouter.patch("/cart/:itemId", gateWrite, requireAuth, (req, res) => {
  const item = store.cart.find((i) => i.itemId === req.params.itemId);
  if (!item) {
    fail(res, ERR.NOT_FOUND, COPY.C036_NOT_FOUND);
    return;
  }
  const qty = Math.max(1, Math.min(MAX_QTY, Number(req.body?.qty) || 1));
  item.qty = qty;
  ok(res, cartView());
});

// API-011 切换勾选
cartRouter.patch("/cart/:itemId/select", gateWrite, requireAuth, (req, res) => {
  const item = store.cart.find((i) => i.itemId === req.params.itemId);
  if (!item) {
    fail(res, ERR.NOT_FOUND, COPY.C036_NOT_FOUND);
    return;
  }
  item.selected = Boolean(req.body?.selected);
  ok(res, cartView());
});

// API-012 删除项（无二次确认）
cartRouter.delete("/cart/:itemId", gateWrite, requireAuth, (req, res) => {
  store.cart = store.cart.filter((i) => i.itemId !== req.params.itemId);
  ok(res, cartView());
});
