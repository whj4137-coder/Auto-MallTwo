import { Router } from "express";
import { store } from "../store/InMemoryStore.js";
import { ok } from "../middleware/envelope.js";

export const demoRouter = Router();

// API-019 Demo 重置（仅清会话数据；保留 Admin 内容编辑）
demoRouter.post("/demo/reset", (_req, res) => {
  store.resetSession();
  ok(res, { ok: true });
});
