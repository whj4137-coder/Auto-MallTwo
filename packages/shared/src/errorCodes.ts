// 错误码 — 源自 PRD §12。统一信封 {code,message,data}，code=0 为成功。

export const ERR = {
  OK: 0,
  UNAUTHORIZED: 1001, // 未登录 / 无效 token
  BAD_CREDENTIALS: 1002, // 账号或密码不正确
  DRIVING_BLOCKED: 2001, // 行车拦截
  OFFLINE_BLOCKED: 2002, // 断网拦截
  SCOPE_BLOCKED: 2003, // 展示服务写入越界
  VALIDATION: 4000, // 参数校验失败（Admin 写操作，change 0010；待并入 PRD §12）
  NOT_FOUND: 4004, // 资源不存在
  NOT_CHECKOUTABLE: 4009, // 含下架/售罄项不可结算
  SERVER_ERROR: 5000,
} as const;

export type ErrCode = (typeof ERR)[keyof typeof ERR];

// 4009 细分原因
export type NotCheckoutableReason = "DELISTED" | "SOLD_OUT" | "ALREADY_PAID";
