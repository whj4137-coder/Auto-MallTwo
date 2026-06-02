import { useState } from "react";
import { COPY } from "@apex/shared";
import { useUiStore } from "../stores/uiStore";
import { useSessionStore } from "../stores/sessionStore";
import { useCartStore } from "../stores/cartStore";
import { useMembershipStore } from "../stores/membershipStore";
import { api } from "../lib/api";

// P12 LoginDialog：预填 admin/123456；成功后关闭并自动续作 pendingAction。
export function LoginDialog() {
  const open = useUiStore((s) => s.loginOpen);
  const closeLogin = useUiStore((s) => s.closeLogin);
  const takePending = useUiStore((s) => s.takePending);
  const loginSuccess = useSessionStore((s) => s.loginSuccess);
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("123456");
  const [err, setErr] = useState("");

  if (!open) return null;

  async function submit() {
    const env = await api.login(username, password);
    if (env.code !== 0) {
      setErr(COPY.C003_LOGIN_FAIL);
      return;
    }
    loginSuccess(env.data.token, env.data.user);
    await useCartStore.getState().fetch();
    await useMembershipStore.getState().fetch();
    setErr("");
    closeLogin();
    const pending = takePending();
    if (pending) setTimeout(pending, 0); // 续作原写入动作
  }

  return (
    <div className="scrim" onClick={(e) => e.target === e.currentTarget && undefined /* 点窗外不关闭 */}>
      <div className="dialog">
        <div className="dh">
          <div className="dt">{COPY.C016_LOGIN_TITLE}</div>
          <div className="x" onClick={closeLogin}>×</div>
        </div>
        <div className="note">{COPY.C017_LOGIN_SUB}</div>
        <div className="field">
          <label>账号</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div className="field">
          <label>密码</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {err && <div className="err">{err}</div>}
        <div className="acts">
          <button className="btn ghost" onClick={closeLogin}>{COPY.C019_LOGIN_CANCEL}</button>
          <button className="btn" onClick={submit}>{COPY.C018_LOGIN_OK}</button>
        </div>
      </div>
    </div>
  );
}
