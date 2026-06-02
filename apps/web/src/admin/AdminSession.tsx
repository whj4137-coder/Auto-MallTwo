import { useEffect, useState } from "react";
import { ERR } from "@apex/shared";
import { api, type AdminSession as Snap } from "../lib/api";

export function AdminSession() {
  const [s, setS] = useState<Snap | null>(null);
  const load = () => api.adminSession().then((env) => env.code === ERR.OK && setS(env.data));
  useEffect(() => { load(); }, []);

  const reset = async () => { await api.reset(); load(); };

  const Kpi = ({ label, value, cls = "" }: { label: string; value: string | number; cls?: string }) => (
    <div className="card kpi"><div className="kl">{label}</div><div className={`kv ${cls}`}>{value}</div></div>
  );

  return (
    <main className="acontent">
      <div className="ah"><h2>演示会话</h2><span className="sp" />
        <button className="btn ghost" style={{ height: 36, padding: "0 16px", fontSize: 13 }} onClick={reset}>重置演示会话</button>
      </div>
      {s && (
        <>
          <div className="akpi">
            <Kpi label="会员状态" value={s.membership} cls={s.membership === "ACTIVE" ? "teal" : "amber"} />
            <Kpi label="购物车数量" value={s.cartCount} />
            <Kpi label="已勾选" value={s.cartSelected} />
            <Kpi label="订单数量" value={s.orderCount} cls="green" />
          </div>
          <div className="akpi" style={{ marginTop: 12 }}>
            <Kpi label="Checkout 数" value={s.checkoutCount} />
            <Kpi label="实物序号 seqP" value={s.seq.seqP} />
            <Kpi label="会员序号 seqM" value={s.seq.seqM} />
            <div className="card kpi"><div className="kl">登录/驾驶/网络</div><div className="kv" style={{ fontSize: 13 }}>各客户端 Demo 态</div></div>
          </div>
        </>
      )}
      <div style={{ marginTop: 14, fontSize: 12, color: "var(--ink3)" }}>
        重置仅清空演示会话数据（购物车 / checkout / 订单 / 会员 / 序号归零），不还原 Admin 对商品 / Banner / 服务的内容编辑。登录 / 驾驶 / 网络为前台 Demo Bar 各客户端状态，服务端不持有。
      </div>
    </main>
  );
}
