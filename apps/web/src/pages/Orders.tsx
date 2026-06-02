import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Order } from "@apex/shared";
import { ERR, COPY } from "@apex/shared";
import { api } from "../lib/api";
import { yuan } from "../lib/money";
import { Glyph } from "../components/icons";
import { useSessionStore } from "../stores/sessionStore";
import { useUiStore } from "../stores/uiStore";

export function Orders() {
  const nav = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const auth = useSessionStore((s) => s.auth);

  const load = () => api.orders().then((env) => env.code === ERR.OK && setOrders(env.data));
  useEffect(() => {
    if (auth === "GUEST") useUiStore.getState().openLogin(load);
    else load();
  }, [auth]);

  if (orders.length === 0) {
    return (
      <main className="main">
        <div className="phead"><span className="ptitle">订单中心</span></div>
        <div className="empty">
          <div className="ec"><Glyph name="doc" /></div>
          <div>{COPY.C013_ORDER_EMPTY}</div>
          <button className="btn ghost" onClick={() => nav("/")}>{COPY.C041_ORDER_EMPTY_BTN}</button>
        </div>
      </main>
    );
  }

  return (
    <main className="main">
      <div className="phead"><span className="ptitle">订单中心</span></div>
      <div className="scroll" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {orders.map((o) => {
          const mem = o.type === "MEMBERSHIP";
          return (
            <div key={o.orderNo} className="card hov" style={{ display: "flex", alignItems: "center", gap: 14, padding: 14 }}
              onClick={() => nav(`/orders/${o.orderNo}`)}>
              <div className={`tile stile ${mem ? "t-mem" : "t-car"}`} style={{ width: 46, height: 46 }}>
                <Glyph name={mem ? "star" : "box"} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{o.lines[0]?.name}{o.lines.length > 1 ? ` 等 ${o.lines.length} 件` : ""}</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink3)", marginTop: 3 }}>{o.orderNo} · {new Date(o.createdAt).toLocaleString("zh-CN", { hour12: false }).slice(5, 16)}</div>
              </div>
              <span className="price">{yuan(o.totalCents)}</span>
              <span className={`tag ${mem ? "memb" : "phys"}`}>{mem ? COPY.C033_TAG_ACTIVATED : COPY.C032_TAG_PAID}</span>
            </div>
          );
        })}
      </div>
    </main>
  );
}
