import { useNavigate } from "react-router-dom";
import { useSessionStore } from "../stores/sessionStore";
import { useCartStore } from "../stores/cartStore";
import { useMembershipStore } from "../stores/membershipStore";
import { useUiStore } from "../stores/uiStore";
import { api } from "../lib/api";

// 顶部 Demo Bar：三组状态仅此处切换，绝不自动触发。
export function DemoBar() {
  const nav = useNavigate();
  const { auth, drive, net, setDrive, setNet, loginSuccess, logout } = useSessionStore();
  const cartCount = useCartStore((s) => s.count);

  async function setAuth(target: "LOGGED_IN" | "GUEST") {
    if (target === auth) return;
    if (target === "LOGGED_IN") {
      const env = await api.login("admin", "123456");
      if (env.code === 0) {
        loginSuccess(env.data.token, env.data.user);
        await useCartStore.getState().fetch();
        await useMembershipStore.getState().fetch();
      }
    } else {
      await api.logout();
      logout();
      useCartStore.getState().clearLocal();
    }
  }

  async function reset() {
    await api.reset();
    useSessionStore.getState().resetSession();
    useCartStore.getState().clearLocal();
    useMembershipStore.getState().clearLocal();
    useUiStore.getState().toast("演示数据已重置");
    nav("/");
  }

  return (
    <div className="bar">
      <span className="badge">DEMO</span>
      <span className="brand">APEX <b>DRIVE</b> STORE</span>
      <div className="segs">
        <div className="seg">
          <b className={drive === "PARKED" ? "on" : ""} onClick={() => setDrive("PARKED")}>驻车</b>
          <i className={drive === "DRIVING" ? "on" : ""} onClick={() => setDrive("DRIVING")}>行车</i>
        </div>
        <div className="seg">
          <b className={net === "ONLINE" ? "on" : ""} onClick={() => setNet("ONLINE")}>在线</b>
          <i className={net === "OFFLINE" ? "on" : ""} onClick={() => setNet("OFFLINE")}>断网</i>
        </div>
        <div className="seg">
          <b className={auth === "LOGGED_IN" ? "on" : ""} onClick={() => setAuth("LOGGED_IN")}>已登录</b>
          <i className={auth === "GUEST" ? "on" : ""} onClick={() => setAuth("GUEST")}>未登录</i>
        </div>
      </div>
      <span className="spacer" />
      <span className="readout">
        STATUS <em>{auth === "LOGGED_IN" ? "USER" : "GUEST"}</em> · {drive} · {net} · CART {cartCount}
      </span>
      <button className="reset" onClick={reset}>重置数据</button>
    </div>
  );
}
