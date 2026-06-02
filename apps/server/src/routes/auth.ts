import { Router } from "express";
import { nanoid } from "nanoid";
import { ERR, COPY } from "@apex/shared";
import { store } from "../store/InMemoryStore.js";
import { DEMO_PASSWORD } from "../store/seed.js";
import { ok, fail } from "../middleware/envelope.js";
import { requireAuth } from "../middleware/auth.js";

export const authRouter = Router();

// API-006 登录（admin/123456）→ 发不透明 token
authRouter.post("/auth/login", (req, res) => {
  const { username, password } = req.body ?? {};
  if (username !== store.user.username || password !== DEMO_PASSWORD) {
    fail(res, ERR.BAD_CREDENTIALS, COPY.C003_LOGIN_FAIL);
    return;
  }
  const token = nanoid();
  store.tokens.add(token);
  ok(res, { token, user: store.user });
});

// API-007 登出（保留会话数据，仅清 token）
authRouter.post("/auth/logout", requireAuth, (req, res) => {
  const header = req.header("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  store.tokens.delete(token);
  ok(res, { ok: true });
});

// API-018 我的信息
authRouter.get("/me", (_req, res) => {
  ok(res, store.user);
});
