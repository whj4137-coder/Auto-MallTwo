import { useNavigate, useParams } from "react-router-dom";
import { COPY } from "@apex/shared";
import { api } from "../lib/api";
import { useLoad } from "../lib/useLoad";
import { Glyph, typeVisual } from "../components/icons";
import { PageFallback } from "../components/PageFallback";
import { useUiStore } from "../stores/uiStore";

export function ServiceDetail() {
  const { code } = useParams();
  const nav = useNavigate();
  const { data: p, status, reload } = useLoad(() => api.product(code!), [code]);
  const toast = useUiStore((s) => s.toast);

  if (status !== "ok" || !p) return <PageFallback status={status} onRetry={reload} />;
  const v = typeVisual(p.type, p.category);
  // §15.9.6 充电/生活服务的说明文案（COPY-007 / COPY-008）
  const svcNote = p.category === "cat_life" ? COPY.C008_LIFE_DESC : COPY.C007_CHARGE_DESC;

  return (
    <main className="main">
      <div className="phead"><span className="back" onClick={() => nav(-1)}><Glyph name="back" /> {COPY.C044_BACK}</span></div>
      <div className="detail">
        <div className="limg"><div className={`big tile ${v.cls}`} style={{ height: "100%" }}><Glyph name={v.icon} cls="" /></div></div>
        <div className="rcol">
          <div className="nm">{p.name}</div>
          <div className="blk" style={{ marginTop: 14 }}><div className="lab" style={{ fontSize: 14, color: "var(--ink2)" }}>{p.serviceDesc}</div></div>
          <div className="blk"><div className="lab" style={{ fontSize: 13, color: "var(--ink3)" }}>{svcNote}</div></div>
          <div className="actions">
            {/* §15.9.6 灰按钮：点击只提示暂未开放，不发写入 */}
            <button className="btn dis" onClick={() => toast(COPY.C006_SVC_BTN)}>{COPY.C006_SVC_BTN}</button>
          </div>
          <div style={{ marginTop: 14, fontSize: 12, color: "var(--ink3)" }}>{COPY.C042_SVC_FOOTER}</div>
        </div>
      </div>
    </main>
  );
}
