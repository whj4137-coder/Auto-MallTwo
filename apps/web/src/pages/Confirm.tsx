import { useNavigate, useParams } from "react-router-dom";
import { COPY } from "@apex/shared";
import { api } from "../lib/api";
import { useLoad } from "../lib/useLoad";
import { yuan } from "../lib/money";
import { PageFallback } from "../components/PageFallback";
import { GatedButton } from "../components/gate/GatedButton";

export function Confirm() {
  const { id } = useParams();
  const nav = useNavigate();
  const { data: c, status, reload } = useLoad(() => api.getCheckout(id!), [id]);

  if (status === "loading") return <PageFallback status="loading" onRetry={reload} />;
  // §15.9.8 checkout 失效（4004/错误）→ COPY-034 + 返回购物车
  if (status !== "ok" || !c) {
    return (
      <main className="main">
        <div className="empty" style={{ gap: 14 }}>
          <div className="et">{COPY.C034_CHECKOUT_EXPIRED}</div>
          <button className="btn ghost" onClick={() => nav("/cart")}>{COPY.C044_BACK}</button>
        </div>
      </main>
    );
  }
  const isMem = c.type === "MEMBERSHIP";

  return (
    <main className="main">
      <div className="phead"><span className="ptitle">{isMem ? COPY.C031_CONFIRM_MEM : COPY.C030_CONFIRM_PHYS}</span></div>
      <div className="ls">
        <div className="left scroll">
          {c.receiver && (
            <div className="card" style={{ padding: 16, marginBottom: 10 }}>
              <div className="sh" style={{ marginBottom: 10 }}>收货信息</div>
              <div style={{ fontSize: 14 }}>{c.receiver.name} · {c.receiver.phone}</div>
              <div style={{ fontSize: 13, color: "var(--ink2)", marginTop: 4 }}>{c.receiver.address}</div>
            </div>
          )}
          <div className="card" style={{ padding: 16, marginBottom: 10 }}>
            <div className="sh" style={{ marginBottom: 10 }}>商品清单</div>
            {c.lines.map((l, idx) => (
              <div key={idx} className="sline" style={{ marginBottom: 8 }}>
                <span>{l.name} {[l.color, l.capacity].filter(Boolean).join("/")} ×{l.qty}</span>
                <span className="price">{yuan(l.lineTotalCents)}</span>
              </div>
            ))}
          </div>
          {c.deliveryNote && (
            <div className="card" style={{ padding: 16 }}>
              <div className="sh" style={{ marginBottom: 10 }}>配送说明</div>
              <div style={{ fontSize: 13, color: "var(--ink2)" }}>{c.deliveryNote}</div>
            </div>
          )}
        </div>
        <div className="right">
          <div className="card summary">
            <h3>支付摘要</h3>
            <div className="sline">商品合计<span className="v">{yuan(c.totalCents)}</span></div>
            <div className="stotal">应付<span className="price">{yuan(c.totalCents)}</span></div>
            <GatedButton className="btn block" action={() => nav(`/pay/${c.checkoutId}`)}>{COPY.C024_TO_PAY}</GatedButton>
          </div>
        </div>
      </div>
    </main>
  );
}
