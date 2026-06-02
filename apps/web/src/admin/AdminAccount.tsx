import { useEffect, useState } from "react";
import type { UserInfo } from "@apex/shared";
import { ERR } from "@apex/shared";
import { api } from "../lib/api";

// 账号信息（个人 + 车辆，只读）。PRD §10.4 固定 Mock，本期不可编辑。
export function AdminAccount() {
  const [u, setU] = useState<UserInfo | null>(null);
  useEffect(() => { api.me().then((env) => env.code === ERR.OK && setU(env.data)); }, []);
  if (!u) return <main className="acontent"><div className="empty">加载中…</div></main>;

  const Row = ({ k, v }: { k: string; v: string }) => (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--line)", fontSize: 13 }}>
      <span style={{ color: "var(--ink3)" }}>{k}</span><span>{v}</span>
    </div>
  );

  return (
    <main className="acontent">
      <div className="ah"><h2>账号信息</h2><span className="sp" /><span style={{ fontSize: 12, color: "var(--ink3)" }}>演示固定数据 · 只读（PRD §10.4）</span></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div className="card" style={{ padding: 18 }}>
          <div className="sh" style={{ marginBottom: 8 }}>个人信息</div>
          <Row k="用户名" v={u.username} />
          <Row k="显示名" v={u.displayName} />
          <Row k="手机号" v={u.phoneMasked} />
          <Row k="收货人" v={`${u.receiver.name} · ${u.receiver.phone}`} />
          <Row k="收货地址" v={u.receiver.address} />
        </div>
        <div className="card" style={{ padding: 18 }}>
          <div className="sh" style={{ marginBottom: 8 }}>车辆信息</div>
          <Row k="车型" v={u.vehicle} />
          <Row k="车牌" v={u.plateMasked} />
          <Row k="车辆颜色" v={u.vehicleColor} />
        </div>
      </div>
    </main>
  );
}
