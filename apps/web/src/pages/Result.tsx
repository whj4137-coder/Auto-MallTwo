import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { Order } from "@apex/shared";
import { COPY } from "@apex/shared";
import { api } from "../lib/api";
import { useLoad } from "../lib/useLoad";
import { yuan } from "../lib/money";
import { Glyph } from "../components/icons";
import { PageFallback } from "../components/PageFallback";

export function Result() {
  const nav = useNavigate();
  const { orderNo } = useParams();
  // 快路径：支付成功跳转携带的 router state；慢路径（刷新/直达）：按 orderNo 调 API-024 兜底
  const fromState = (useLocation().state ?? {}) as { order?: Order };
  const { data: fetched, status, reload } = useLoad(() => api.order(orderNo!), [orderNo]);
  const order = fromState.order ?? fetched ?? undefined;

  // 无 state 时依赖 API-024：骨架 / 未找到(COPY-036) / 错误可重试
  if (!fromState.order && status !== "ok") {
    return <PageFallback status={status} onRetry={reload} />;
  }
  if (!order) return <PageFallback status="notfound" onRetry={reload} />;
  const isMem = order.type === "MEMBERSHIP";

  return (
    <main className="main">
      <div className="empty" style={{ gap: 18 }}>
        <div className="ec" style={{ width: 72, height: 72, color: "var(--green)", borderColor: "var(--line2)" }}>
          <Glyph name="check" cls="" />
        </div>
        <div style={{ fontFamily: "var(--disp)", fontWeight: 700, fontSize: 24, color: "var(--ink)" }}>
          {isMem ? COPY.C029_MEM_TITLE : COPY.C028_PAID_TITLE}
        </div>
        <div className="card" style={{ padding: "14px 22px", display: "flex", gap: 22, fontFamily: "var(--mono)", fontSize: 13 }}>
          <span style={{ color: "var(--teal)" }}>{order.orderNo}</span>
          <span className="price">{yuan(order.totalCents)}</span>
          <span className="badge-ok">{isMem ? COPY.C033_TAG_ACTIVATED : COPY.C032_TAG_PAID}</span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button className="btn ghost" onClick={() => nav("/")}>{COPY.C027_HOME}</button>
          <button className="btn" onClick={() => nav("/orders")}>{COPY.C026_VIEW_ORDER}</button>
        </div>
      </div>
    </main>
  );
}
