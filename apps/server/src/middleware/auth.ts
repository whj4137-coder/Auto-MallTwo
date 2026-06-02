import type { Request, Response, NextFunction } from "express";
import { ERR, COPY } from "@apex/shared";
import { store } from "../store/InMemoryStore.js";
import { fail } from "./envelope.js";

// 写入接口鉴权：需有效 Bearer token，否则 1001。
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.header("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token || !store.tokens.has(token)) {
    fail(res, ERR.UNAUTHORIZED, "请先登录");
    return;
  }
  next();
}

// Admin 鉴权同机制（共用 token 池，演示账号一致）。
export const requireAdmin = requireAuth;

export { COPY };
