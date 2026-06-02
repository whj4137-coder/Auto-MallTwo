import type { Envelope } from "@apex/shared";
import { useSessionStore } from "../stores/sessionStore";
import { useAdminStore } from "../stores/adminStore";

// 统一信封解析 + 注入 Authorization / X-Demo-Drive / X-Demo-Net。
// 返回 {code,message,data}；调用方据 code 处理（0=成功）。

export class ApiError extends Error {
  constructor(public code: number, message: string, public data: unknown = null) {
    super(message);
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<Envelope<T>> {
  const { token, drive, net } = useSessionStore.getState();
  // /admin/* 用 Admin 令牌，其余用前台 session 令牌
  const isAdmin = path.startsWith("/admin");
  const bearer = isAdmin ? useAdminStore.getState().token : token;
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (bearer) headers["authorization"] = `Bearer ${bearer}`;
  headers["x-demo-drive"] = drive;
  headers["x-demo-net"] = net;

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const env = (await res.json()) as Envelope<T>;
  return env;
}

export const http = {
  get: <T>(p: string) => request<T>("GET", p),
  post: <T>(p: string, b?: unknown) => request<T>("POST", p, b),
  patch: <T>(p: string, b?: unknown) => request<T>("PATCH", p, b),
  del: <T>(p: string) => request<T>("DELETE", p),
};
