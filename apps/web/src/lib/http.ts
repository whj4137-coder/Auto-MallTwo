import type { Envelope } from "@apex/shared";
import { ERR, COPY } from "@apex/shared";
import { useSessionStore } from "../stores/sessionStore";
import { useAdminStore } from "../stores/adminStore";
import { useUiStore } from "../stores/uiStore";

// 统一信封解析 + 注入 Authorization / X-Demo-Drive / X-Demo-Net。
// 返回 {code,message,data}；调用方据 code 处理（0=成功）。

export class ApiError extends Error {
  constructor(public code: number, message: string, public data: unknown = null) {
    super(message);
  }
}

// 客户端合成的网络失败码（非后端 §12 错误码）：fetch 抛错时统一兜底，使调用方 env.code!==OK 短路。
export const NETWORK_FAIL = -1;

async function request<T>(method: string, path: string, body?: unknown): Promise<Envelope<T>> {
  const { token, drive, net } = useSessionStore.getState();
  // /admin/* 用 Admin 令牌，其余用前台 session 令牌
  const isAdmin = path.startsWith("/admin");
  const bearer = isAdmin ? useAdminStore.getState().token : token;
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (bearer) headers["authorization"] = `Bearer ${bearer}`;
  headers["x-demo-drive"] = drive;
  headers["x-demo-net"] = net;

  try {
    const res = await fetch(`/api${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const env = (await res.json()) as Envelope<T>;
    // §15.9.1 全局异常：5000 集中提示 COPY-037（调用方仍按 code 各自处理 4004/1001 等）
    if (env.code === ERR.SERVER_ERROR) useUiStore.getState().toast(COPY.C037_SERVER);
    return env;
  } catch {
    // §15.9.1 网络失败：toast COPY-038 并返回合成信封，避免未捕获 rejection / 白屏
    useUiStore.getState().toast(COPY.C038_NETWORK);
    return { code: NETWORK_FAIL, message: COPY.C038_NETWORK, data: null as unknown as T };
  }
}

export const http = {
  get: <T>(p: string) => request<T>("GET", p),
  post: <T>(p: string, b?: unknown) => request<T>("POST", p, b),
  patch: <T>(p: string, b?: unknown) => request<T>("PATCH", p, b),
  del: <T>(p: string) => request<T>("DELETE", p),
};
