import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Order } from "@apex/shared";
import { ERR, COPY } from "@apex/shared";
import { api } from "../lib/api";
import { yuan } from "../lib/money";
import { Glyph } from "../components/icons";
import { PageFallback } from "../components/PageFallback";
import { useSessionStore } from "../stores/sessionStore";
import { useUiStore } from "../stores/uiStore";

export function Orders() {
  const nav = useNavigate();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [err, setErr] = useState(false);
  const auth = useSessionStore((s) => s.auth);

  const load = () => {
    setErr(false);
    api.orders().then((env) => {
      if (env.code === ERR.OK) setOrders(env.data);
      else if (env.code === ERR.UNAUTHORIZED) useUiStore.getState().openLogin(load);
      else setErr(true); // 5000/网络：toast 已抛，给重试入口
    });
  };
  useEffect(() => {
    if (auth === "GUEST") useUiStore.getState().openLogin(load);
    else load();
  }, [auth]);

  if (err) return <PageFallback status="error" onRetry={load} />;
  if (orders === null) return <PageFallback status="loading" onRetry={load} />;

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
              <span className={`tag ${mem ? "memb" : "phys"}`}>{o.status === "ACTIVATED" ? COPY.C033_TAG_ACTIVATED : COPY.C032_TAG_PAID}</span>
            </div>
          );
        })}
      </div>
    </main>
  );
}
