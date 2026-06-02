import { useEffect, useState } from "react";
import type { Order } from "@apex/shared";
import { ERR, COPY } from "@apex/shared";
import { api } from "../lib/api";
import { yuan } from "../lib/money";

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [type, setType] = useState("ALL");

  useEffect(() => { api.adminOrders().then((env) => env.code === ERR.OK && setOrders(env.data)); }, []);
  const rows = orders.filter((o) => type === "ALL" || o.type === type);

  return (
    <main className="acontent">
      <div className="ah"><h2>订单管理</h2><span className="sp" />
        <div className="filters">
          <select className="fsel" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="ALL">全部类型</option>
            <option value="PHYSICAL">实物</option>
            <option value="MEMBERSHIP">会员</option>
          </select>
        </div>
      </div>
      <div className="tablewrap">
        <table className="tb">
          <thead><tr><th>订单号</th><th>类型</th><th>商品</th><th>金额</th><th>状态</th><th>下单时间</th></tr></thead>
          <tbody>
            {rows.map((o) => {
              const mem = o.type === "MEMBERSHIP";
              return (
                <tr key={o.orderNo}>
                  <td className="mono">{o.orderNo}</td>
                  <td><span className={`tag ${mem ? "memb" : "phys"}`}>{mem ? "会员" : "实物"}</span></td>
                  <td>{o.lines[0]?.name}{o.lines.length > 1 ? ` 等${o.lines.length}件` : ""}</td>
                  <td className="amt">{yuan(o.totalCents)}</td>
                  <td><span className="tag on">{mem ? COPY.C033_TAG_ACTIVATED : COPY.C032_TAG_PAID}</span></td>
                  <td className="mono">{new Date(o.createdAt).toLocaleString("zh-CN", { hour12: false }).slice(5, 16)}</td>
                </tr>
              );
            })}
            {rows.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--ink3)", padding: 28 }}>{COPY.C013_ORDER_EMPTY}</td></tr>}
          </tbody>
        </table>
      </div>
    </main>
  );
}
