import { useEffect, useState } from "react";
import type { UserInfo } from "@apex/shared";
import { ERR, COPY } from "@apex/shared";
import { api } from "../lib/api";
import { useMembershipStore } from "../stores/membershipStore";

export function Mine() {
  const [u, setU] = useState<UserInfo | null>(null);
  const status = useMembershipStore((s) => s.status);

  useEffect(() => {
    api.me().then((env) => env.code === ERR.OK && setU(env.data));
    useMembershipStore.getState().fetch();
  }, []);

  if (!u) return <main className="main"><div className="empty">加载中…</div></main>;

  const Card = ({ title, rows }: { title: string; rows: [string, string][] }) => (
    <div className="card" style={{ padding: 16 }}>
      <div className="sh" style={{ marginBottom: 10 }}>{title}</div>
      {rows.map(([k, v]) => (
        <div key={k} className="sline">{k}<span className="v">{v}</span></div>
      ))}
    </div>
  );

  return (
    <main className="main">
      <div className="phead"><span className="ptitle">我的</span></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Card title="账号" rows={[["用户名", u.username], ["显示名", u.displayName], ["手机号", u.phoneMasked]]} />
        <Card title="车辆" rows={[["车型", u.vehicle], ["车牌", u.plateMasked], ["颜色", u.vehicleColor]]} />
        <Card title="收货地址" rows={[["收件人", u.receiver.name], ["电话", u.receiver.phone], ["地址", u.receiver.address]]} />
        <Card title="会员" rows={[["状态", status === "ACTIVE" ? COPY.C033_TAG_ACTIVATED : "未开通"]]} />
      </div>
    </main>
  );
}
