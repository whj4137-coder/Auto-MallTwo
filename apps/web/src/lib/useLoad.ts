import { useCallback, useEffect, useState } from "react";
import type { Envelope } from "@apex/shared";
import { ERR } from "@apex/shared";
import { useUiStore } from "../stores/uiStore";

export type LoadStatus = "loading" | "ok" | "error" | "notfound";

// 统一的「加载 + 错误/404/重试」数据钩子（§15.9.1 页面加载异常规则）。
// - OK → status=ok + data
// - 4004 → status=notfound（页面显 COPY-036 + 返回/重试）
// - 1001 → 弹 LoginDialog，登录成功后自动重载（§15.9.11/15.9.14 GUEST 进订单）
// - 其它（5000/网络合成码等）→ status=error（页面显重试；toast 已由 http 层抛出）
export function useLoad<T>(fn: () => Promise<Envelope<T>>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<LoadStatus>("loading");

  // run 依赖外部 deps（如路由参数）；reload 复用同一函数
  const run = useCallback(() => {
    setStatus("loading");
    fn().then((env) => {
      if (env.code === ERR.OK) {
        setData(env.data);
        setStatus("ok");
      } else if (env.code === ERR.UNAUTHORIZED) {
        // §15.9.11/15.9.14 GUEST 进订单：弹登录、保持骨架；登录成功续作=重载本页
        setStatus("loading");
        useUiStore.getState().openLogin(() => run());
      } else if (env.code === ERR.NOT_FOUND) {
        setStatus("notfound");
      } else {
        setStatus("error");
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(run, [run]);

  return { data, status, reload: run };
}
