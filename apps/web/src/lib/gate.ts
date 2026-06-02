import { COPY } from "@apex/shared";
import { useSessionStore } from "../stores/sessionStore";
import { useUiStore } from "../stores/uiStore";

// GateGuard：写入动作前校验 LOGGED_IN AND PARKED AND ONLINE。
// 优先级 DRIVING > OFFLINE > GUEST。返回 true=可继续；false=已拦截（toast/弹登录）。
export function guardWrite(action: () => void): void {
  const { auth, drive, net } = useSessionStore.getState();
  const ui = useUiStore.getState();
  if (drive === "DRIVING") {
    ui.toast(COPY.C001_DRIVING);
    return;
  }
  if (net === "OFFLINE") {
    ui.toast(COPY.C002_OFFLINE);
    return;
  }
  if (auth === "GUEST") {
    ui.openLogin(action); // 登录成功后自动续作
    return;
  }
  action();
}

// 交易按钮是否置灰（DRIVING/OFFLINE 时）。GUEST 不置灰（点了弹登录）。
export function isBlocked(): boolean {
  const { drive, net } = useSessionStore.getState();
  return drive === "DRIVING" || net === "OFFLINE";
}
