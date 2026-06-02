import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { COPY } from "@apex/shared";
import { api } from "../lib/api";
import { useAdminStore } from "../stores/adminStore";

export function AdminLogin() {
  const nav = useNavigate();
  const setToken = useAdminStore((s) => s.setToken);
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("123456");
  const [err, setErr] = useState("");

  async function submit() {
    const env = await api.adminLogin(username, password);
    if (env.code !== 0) { setErr(COPY.C003_LOGIN_FAIL); return; }
    setToken(env.data.token);
    nav("/admin/products");
  }

  return (
    <div className="device" style={{ alignItems: "center", justifyContent: "center" }}>
      <div className="dialog" style={{ position: "relative", zIndex: 2 }}>
        <div className="dh"><div className="dt">后台登录</div></div>
        <div className="note">{COPY.C017_LOGIN_SUB}</div>
        <div className="field"><label>账号</label><input value={username} onChange={(e) => setUsername(e.target.value)} /></div>
        <div className="field"><label>密码</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        {err && <div className="err">{err}</div>}
        <div className="acts"><button className="btn block" onClick={submit}>{COPY.C018_LOGIN_OK}</button></div>
      </div>
    </div>
  );
}
