import type { Request, Response, NextFunction } from "express";
import { ERR, COPY } from "@apex/shared";
import { fail } from "./envelope.js";

// 写入门禁中间件（兜底）：前端把 drive/net 通过头传后端，使后端可独立返回 2001/2002。
// 优先级 DRIVING > OFFLINE > GUEST（PRD §8）。为保证此优先级，写路由必须按
// `gateWrite, requireAuth` 顺序注册——先判行车/断网，未命中才轮到 requireAuth 判 GUEST(1001)。
export function gateWrite(req: Request, res: Response, next: NextFunction): void {
  if (req.header("x-demo-drive") === "DRIVING") {
    fail(res, ERR.DRIVING_BLOCKED, COPY.C001_DRIVING);
    return;
  }
  if (req.header("x-demo-net") === "OFFLINE") {
    fail(res, ERR.OFFLINE_BLOCKED, COPY.C002_OFFLINE);
    return;
  }
  next();
}
