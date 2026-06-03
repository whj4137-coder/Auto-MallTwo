import { useNavigate, useParams } from "react-router-dom";
import { COPY } from "@apex/shared";
import { api } from "../lib/api";
import { useLoad } from "../lib/useLoad";
import { Glyph, typeVisual } from "../components/icons";
import { PageFallback } from "../components/PageFallback";

export function ServiceDetail() {
  const { code } = useParams();
  const nav = useNavigate();
  const { data: p, status, reload } = useLoad(() => api.product(code!), [code]);

  if (status !== "ok" || !p) return <PageFallback status={status} onRetry={reload} />;
  const v = typeVisual(p.type, p.category);

  return (
    <main className="main">
      <div className="phead"><span className="back" onClick={() => nav(-1)}><Glyph name="back" /> {COPY.C044_BACK}</span></div>
      <div className="detail">
        <div className="limg"><div className={`big tile ${v.cls}`} style={{ height: "100%" }}><Glyph name={v.icon} cls="" /></div></div>
        <div className="rcol">
          <div className="nm">{p.name}</div>
          <div className="blk" style={{ marginTop: 14 }}><div className="lab" style={{ fontSize: 14, color: "var(--ink2)" }}>{p.serviceDesc}</div></div>
          <div className="actions">
            <button className="btn dis" disabled>{COPY.C006_SVC_BTN}</button>
          </div>
          <div style={{ marginTop: 14, fontSize: 12, color: "var(--ink3)" }}>{COPY.C042_SVC_FOOTER}</div>
        </div>
      </div>
    </main>
  );
}
