import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Checkout } from "@apex/shared";
import { ERR, COPY } from "@apex/shared";
import { api } from "../lib/api";
import { yuan } from "../lib/money";
import { GatedButton } from "../components/gate/GatedButton";

export function Confirm() {
  const { id } = useParams();
  const nav = useNavigate();
  const [c, setC] = useState<Checkout | null>(null);

  useEffect(() => {
    if (id) api.getCheckout(id).then((env) => env.code === ERR.OK && setC(env.data));
  }, [id]);

  if (!c) return <main className="main"><div className="empty">{COPY.C034_CHECKOUT_EXPIRED}</div></main>;
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
