import { Router } from "express";
import { ERR, COPY } from "@apex/shared";
import { store } from "../store/InMemoryStore.js";
import { ok, fail } from "../middleware/envelope.js";
import { requireAuth } from "../middleware/auth.js";

export const ordersRouter = Router();

// API-016 订单列表（时间降序，不分页）
ordersRouter.get("/orders", requireAuth, (_req, res) => {
  ok(res, store.orders);
});

// API-024 订单详情
ordersRouter.get("/orders/:orderNo", requireAuth, (req, res) => {
  const order = store.orders.find((o) => o.orderNo === req.params.orderNo);
  if (!order) {
    fail(res, ERR.NOT_FOUND, COPY.C036_NOT_FOUND);
    return;
  }
  ok(res, order);
});

// API-017 会员状态
ordersRouter.get("/membership", requireAuth, (_req, res) => {
  ok(res, store.membership);
});
