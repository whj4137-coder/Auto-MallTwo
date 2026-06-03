import { useNavigate, useParams } from "react-router-dom";
import { ERR, COPY } from "@apex/shared";
import { api } from "../lib/api";
import { useLoad } from "../lib/useLoad";
import { yuan } from "../lib/money";
import { PageFallback } from "../components/PageFallback";
import { GatedButton } from "../components/gate/GatedButton";
import { useCartStore } from "../stores/cartStore";
import { useMembershipStore } from "../stores/membershipStore";
import { useUiStore } from "../stores/uiStore";

export function Pay() {
  const { id } = useParams();
  const nav = useNavigate();
  const { data: c, status, reload } = useLoad(() => api.getCheckout(id!), [id]);
  const toast = useUiStore((s) => s.toast);

  if (status === "loading") return <PageFallback status="loading" onRetry={reload} />;
  // §15.9.9 二维码/会话失效 → COPY-035 + 返回
  if (status !== "ok" || !c) {
    return (
      <main className="main">
        <div className="empty" style={{ gap: 14 }}>
          <div className="et">{COPY.C035_QR_EXPIRED}</div>
          <button className="btn ghost" onClick={() => nav(-1)}>{COPY.C044_BACK}</button>
        </div>
      </main>
    );
  }

  const pay = () =>
    api.pay(c.checkoutId).then(async (env) => {
      if (env.code !== ERR.OK) { toast(env.message); return; }
      await useCartStore.getState().fetch();
      await useMembershipStore.getState().fetch();
      nav("/result", { state: { order: env.data.order, type: c.type } });
    });

  return (
    <main className="main">
      <div className="phead"><span className="ptitle">扫码支付</span></div>
      <div className="ls">
        <div className="left" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
          <div className="price" style={{ fontSize: 34 }}>{yuan(c.totalCents)}</div>
          <div style={{ width: 200, height: 200, borderRadius: 16, background: "conic-gradient(from 0deg,#0b0e13 0 25%,#141a23 0 50%,#0b0e13 0 75%,#141a23 0)", border: "1px solid var(--line2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink3)", fontFamily: "var(--mono)", fontSize: 11 }}>QR</div>
          <div style={{ fontSize: 12, color: "var(--ink3)" }}>{COPY.C009_PAY_DESC}</div>
        </div>
        <div className="right">
          <div className="card summary">
            <h3>订单明细</h3>
            {c.lines.map((l, i) => (
              <div key={i} className="sline">{l.name} ×{l.qty}<span className="price">{yuan(l.lineTotalCents)}</span></div>
            ))}
            <div className="stotal">应付<span className="price">{yuan(c.totalCents)}</span></div>
            <GatedButton className="btn block" action={pay}>{COPY.C010_PAY_BTN}</GatedButton>
            <div className="back" style={{ marginTop: 12, justifyContent: "center" }} onClick={() => nav(-1)}>{COPY.C011_PAY_BACK}</div>
          </div>
        </div>
      </div>
    </main>
  );
}
