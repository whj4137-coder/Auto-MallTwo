import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Order } from "@apex/shared";
import { ERR, COPY } from "@apex/shared";
import { api } from "../lib/api";
import { yuan } from "../lib/money";
import { Glyph } from "../components/icons";

export function OrderDetail() {
  const { orderNo } = useParams();
  const nav = useNavigate();
  const [o, setO] = useState<Order | null>(null);

  useEffect(() => {
    if (orderNo) api.order(orderNo).then((env) => env.code === ERR.OK && setO(env.data));
  }, [orderNo]);

  if (!o) return <main className="main"><div className="empty">{COPY.C036_NOT_FOUND}</div></main>;
  const mem = o.type === "MEMBERSHIP";

  return (
    <main className="main">
      <div className="phead"><span className="back" onClick={() => nav("/orders")}><Glyph name="back" /> {COPY.C044_BACK}</span><span className="ptitle">{COPY.C043_ORDER_DETAIL}</span></div>
      <div className="scroll" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div className="card" style={{ padding: 16 }}>
          <div className="sline">订单号<span className="v" style={{ fontFamily: "var(--mono)" }}>{o.orderNo}</span></div>
          <div className="sline">状态<span className="badge-ok">{mem ? COPY.C033_TAG_ACTIVATED : COPY.C032_TAG_PAID}</span></div>
          <div className="sline">下单时间<span className="v">{new Date(o.createdAt).toLocaleString("zh-CN", { hour12: false })}</span></div>
          <div className="sline">支付方式<span className="v">{o.payMethod}</span></div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div className="sh" style={{ marginBottom: 10 }}>商品清单</div>
          {o.lines.map((l, i) => (
            <div key={i} className="sline">{l.name} {[l.color, l.capacity].filter(Boolean).join("/")} ×{l.qty}<span className="price">{yuan(l.lineTotalCents)}</span></div>
          ))}
          <div className="stotal">合计<span className="price">{yuan(o.totalCents)}</span></div>
        </div>
        {mem ? (
          <div className="card" style={{ padding: 16 }}>
            <div className="sh" style={{ marginBottom: 10 }}>会员权益</div>
            <div className="sline">绑定车辆<span className="v">{o.boundVehicle}</span></div>
            <div className="sline">有效期<span className="v">{o.validDays} 天</span></div>
          </div>
        ) : (
          <div className="card" style={{ padding: 16 }}>
            <div className="sh" style={{ marginBottom: 10 }}>收货信息</div>
            <div className="sline">{o.receiver?.name}<span className="v">{o.receiver?.phone}</span></div>
            <div style={{ fontSize: 13, color: "var(--ink2)", marginTop: 4 }}>{o.receiver?.address}</div>
          </div>
        )}
      </div>
    </main>
  );
}
