import { useEffect } from "react";
import { COPY } from "@apex/shared";
import { api } from "../lib/api";
import { useLoad } from "../lib/useLoad";
import { PageFallback } from "../components/PageFallback";
import { useMembershipStore } from "../stores/membershipStore";

export function Mine() {
  const { data: u, status: load, reload } = useLoad(() => api.me(), []);
  const status = useMembershipStore((s) => s.status);

  useEffect(() => { useMembershipStore.getState().fetch(); }, []);

  if (load !== "ok" || !u) return <PageFallback status={load} onRetry={reload} />;

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
