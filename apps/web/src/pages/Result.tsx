import { useLocation, useNavigate } from "react-router-dom";
import type { Order, ProductType } from "@apex/shared";
import { COPY } from "@apex/shared";
import { yuan } from "../lib/money";
import { Glyph } from "../components/icons";

export function Result() {
  const nav = useNavigate();
  const state = (useLocation().state ?? {}) as { order?: Order; type?: ProductType };
  const order = state.order;
  const isMem = state.type === "MEMBERSHIP";

  return (
    <main className="main">
      <div className="empty" style={{ gap: 18 }}>
        <div className="ec" style={{ width: 72, height: 72, color: "var(--green)", borderColor: "var(--line2)" }}>
          <Glyph name="check" cls="" />
        </div>
        <div style={{ fontFamily: "var(--disp)", fontWeight: 700, fontSize: 24, color: "var(--ink)" }}>
          {isMem ? COPY.C029_MEM_TITLE : COPY.C028_PAID_TITLE}
        </div>
        {order && (
          <div className="card" style={{ padding: "14px 22px", display: "flex", gap: 22, fontFamily: "var(--mono)", fontSize: 13 }}>
            <span style={{ color: "var(--teal)" }}>{order.orderNo}</span>
            <span className="price">{yuan(order.totalCents)}</span>
            <span className="badge-ok">{isMem ? COPY.C033_TAG_ACTIVATED : COPY.C032_TAG_PAID}</span>
          </div>
        )}
        <div style={{ display: "flex", gap: 12 }}>
          <button className="btn ghost" onClick={() => nav("/")}>{COPY.C027_HOME}</button>
          <button className="btn" onClick={() => nav("/orders")}>{COPY.C026_VIEW_ORDER}</button>
        </div>
      </div>
    </main>
  );
}
