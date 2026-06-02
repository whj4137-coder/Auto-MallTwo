import type { Response } from "express";
import { ERR } from "@apex/shared";

// 统一响应信封 {code,message,data}。HTTP 状态恒 200，业务码在 body。

export function ok<T>(res: Response, data: T, message = "OK"): void {
  res.status(200).json({ code: ERR.OK, message, data });
}

export function fail(res: Response, code: number, message: string, data: unknown = null): void {
  res.status(200).json({ code, message, data });
}
