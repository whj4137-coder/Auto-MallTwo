import { Router } from "express";
import { nanoid } from "nanoid";
import type { Checkout, CheckoutLine, Order } from "@apex/shared";
import { ERR, COPY } from "@apex/shared";
import { store } from "../store/InMemoryStore.js";
import { ok, fail } from "../middleware/envelope.js";
import { requireAuth } from "../middleware/auth.js";
import { gateWrite } from "../middleware/gate.js";

export const checkoutRouter = Router();

// API-013 创建 Checkout（后端权威定价；校验下架/售罄 → 4009）
checkoutRouter.post("/checkout", gateWrite, requireAuth, (req, res) => {
  const { source, productCode, color, capacity, qty = 1 } = req.body ?? {};

  let lines: CheckoutLine[] = [];
  let type: Checkout["type"] = "PHYSICAL";
  let sourceItemIds: string[] = [];

  if (source === "CART") {
    const selected = store.cart.filter((i) => i.selected);
    if (selected.length === 0) {
      fail(res, ERR.NOT_CHECKOUTABLE, "请先选择商品");
      return;
    }
    for (const i of selected) {
      const p = store.getProduct(i.productCode);
      if (!p || !p.published) {
        fail(res, ERR.NOT_CHECKOUTABLE, COPY.C045_DELISTED, { reason: "DELISTED" });
        return;
      }
      if (p.stock === "SOLD_OUT") {
        fail(res, ERR.NOT_CHECKOUTABLE, COPY.C046_SOLD_OUT, { reason: "SOLD_OUT" });
        return;
      }
      // EDGE-006 / §15.10.4「SKU 仍合法」：购物车快照 SKU 若被 Admin 改没 → 4004
      if ((i.color != null && !p.colors.includes(i.color)) || (i.capacity != null && !p.capacities.includes(i.capacity))) {
        fail(res, ERR.NOT_FOUND, COPY.C036_NOT_FOUND, { reason: "SKU_INVALID" });
        return;
      }
    }
    // 定价按实时商品价（§15.12 EDGE-005）；所选 SKU/数量沿用购物车快照
    lines = selected.map((i) => {
      const p = store.getProduct(i.productCode)!;
      return {
        productCode: i.productCode,
        name: i.name,
        color: i.color,
        capacity: i.capacity,
        unitPriceCents: p.priceCents ?? 0,
        qty: i.qty,
        lineTotalCents: (p.priceCents ?? 0) * i.qty,
      };
    });
    sourceItemIds = selected.map((i) => i.itemId);
    type = "PHYSICAL";
  } else {
    // BUY_NOW：实物 or 会员
    const p = store.getProduct(productCode);
    if (!p || !p.published) {
      fail(res, ERR.NOT_FOUND, COPY.C036_NOT_FOUND);
      return;
    }
    if (p.type === "DISPLAY_SERVICE") {
      fail(res, ERR.SCOPE_BLOCKED, COPY.C039_SCOPE);
      return;
    }
    // §15.10.4 BUY_NOW/MEMBERSHIP 创建校验 membership=INACTIVE：已开通 → 4000（全局单一会员，前台已隐藏入口）
    if (p.type === "MEMBERSHIP" && store.membership.status === "ACTIVE") {
      fail(res, ERR.VALIDATION, COPY.C023_ACTIVATED);
      return;
    }
    if (p.stock === "SOLD_OUT") {
      fail(res, ERR.NOT_CHECKOUTABLE, COPY.C046_SOLD_OUT, { reason: "SOLD_OUT" });
      return;
    }
    // §15.10.4「SKU 合法」：显式传入的 color/capacity 必须属于该商品 → 否则 4000
    if ((color != null && !p.colors.includes(color)) || (capacity != null && !p.capacities.includes(capacity))) {
      fail(res, ERR.VALIDATION, COPY.C036_NOT_FOUND, { reason: "SKU_INVALID" });
      return;
    }
    const lineQty = p.type === "MEMBERSHIP" ? 1 : Math.max(1, Math.min(5, Number(qty) || 1));
    lines = [{
      productCode: p.productCode,
      name: p.name,
      color: color ?? p.colors[0],
      capacity: capacity ?? p.capacities[0],
      unitPriceCents: p.priceCents ?? 0,
      qty: lineQty,
      lineTotalCents: (p.priceCents ?? 0) * lineQty,
    }];
    type = p.type === "MEMBERSHIP" ? "MEMBERSHIP" : "PHYSICAL";
  }

  const totalCents = lines.reduce((s, l) => s + l.lineTotalCents, 0);
  const firstProduct = store.getProduct(lines[0].productCode);
  const checkout: Checkout = {
    checkoutId: nanoid(10),
    source: source === "CART" ? "CART" : "BUY_NOW",
    type,
    lines,
    totalCents,
    paid: false,
    // 实物注入收货信息与配送说明（后端权威，前端不硬编码 §10 字面值）
    receiver: type === "PHYSICAL" ? store.user.receiver : undefined,
    deliveryNote: type === "PHYSICAL" ? firstProduct?.deliveryNote : undefined,
  };
  store.checkouts.set(checkout.checkoutId, checkout);
  if (sourceItemIds.length) store.checkoutCartItemIds.set(checkout.checkoutId, sourceItemIds);
  ok(res, checkout);
});

// API-014 查看 Checkout
checkoutRouter.get("/checkout/:checkoutId", requireAuth, (req, res) => {
  const c = store.checkouts.get(req.params.checkoutId);
  if (!c) {
    fail(res, ERR.NOT_FOUND, COPY.C034_CHECKOUT_EXPIRED);
    return;
  }
  ok(res, c);
});

// API-015 模拟支付 → 落单（仅此处写订单/置会员/删勾选项）
checkoutRouter.post("/checkout/:checkoutId/pay", gateWrite, requireAuth, (req, res) => {
  const c = store.checkouts.get(req.params.checkoutId);
  if (!c) {
    fail(res, ERR.NOT_FOUND, COPY.C035_QR_EXPIRED);
    return;
  }

  // EDGE-013 / §12.1：同一 checkout 已支付 → 4009 ALREADY_PAID，绝不再次落单或递增序号
  if (c.paid) {
    fail(res, ERR.NOT_CHECKOUTABLE, "订单已支付，请勿重复支付", { reason: "ALREADY_PAID" });
    return;
  }

  // 会员幂等：已 ACTIVE 则不再产生新单
  if (c.type === "MEMBERSHIP" && store.membership.status === "ACTIVE") {
    c.paid = true;
    const existing = store.orders.find((o) => o.orderNo === store.membership.orderNo);
    ok(res, { order: existing, membership: store.membership });
    return;
  }

  let order: Order;
  if (c.type === "MEMBERSHIP") {
    const memProduct = store.getProduct(c.lines[0].productCode);
    const orderNo = store.seq.nextM();
    order = {
      orderNo,
      type: "MEMBERSHIP",
      status: "ACTIVATED",
      totalCents: c.totalCents,
      lines: c.lines,
      createdAt: new Date().toISOString(),
      payMethod: "模拟支付",
      validDays: memProduct?.validDays,
      boundVehicle: memProduct?.boundVehicle,
    };
    store.membership = {
      status: "ACTIVE",
      productCode: c.lines[0].productCode,
      orderNo,
      validDays: memProduct?.validDays,
      boundVehicle: memProduct?.boundVehicle,
    };
  } else {
    const orderNo = store.seq.nextP();
    order = {
      orderNo,
      type: "PHYSICAL",
      status: "PAID",
      totalCents: c.totalCents,
      lines: c.lines,
      createdAt: new Date().toISOString(),
      payMethod: "模拟支付",
      receiver: store.user.receiver,
    };
    // CART 来源：删除已结算的勾选项
    const ids = store.checkoutCartItemIds.get(c.checkoutId) ?? [];
    if (ids.length) store.cart = store.cart.filter((i) => !ids.includes(i.itemId));
  }

  store.orders.unshift(order);
  c.paid = true;
  ok(res, { order, membership: store.membership });
});
