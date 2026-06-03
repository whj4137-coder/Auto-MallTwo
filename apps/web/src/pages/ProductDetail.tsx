import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ERR, COPY } from "@apex/shared";
import { api } from "../lib/api";
import { useLoad } from "../lib/useLoad";
import { yuan } from "../lib/money";
import { Glyph, typeVisual } from "../components/icons";
import { ProductMedia } from "../components/ProductMedia";
import { PageFallback } from "../components/PageFallback";
import { GatedButton } from "../components/gate/GatedButton";
import { useCartStore } from "../stores/cartStore";
import { useUiStore } from "../stores/uiStore";

export function ProductDetail() {
  const { code } = useParams();
  const nav = useNavigate();
  const { data: p, status, reload } = useLoad(() => api.product(code!), [code]);
  const [color, setColor] = useState<string | undefined>();
  const [cap, setCap] = useState<string | undefined>();
  const [qty, setQty] = useState(1);
  const add = useCartStore((s) => s.add);
  const toast = useUiStore((s) => s.toast);

  useEffect(() => {
    if (p) { setColor(p.colors[0]); setCap(p.capacities[0]); }
  }, [p]);

  if (status !== "ok" || !p) return <PageFallback status={status} onRetry={reload} />;
  const v = typeVisual(p.type, p.category);
  const soldOut = p.stock === "SOLD_OUT";
  const lineTotal = (p.priceCents ?? 0) * qty;

  const buyNow = () =>
    api.createCheckout({ source: "BUY_NOW", productCode: p.productCode, color, capacity: cap, qty }).then((env) => {
      if (env.code === ERR.OK) nav(`/confirm/${env.data.checkoutId}`);
      else toast(env.message);
    });

  return (
    <main className="main">
      <div className="phead"><span className="back" onClick={() => nav(-1)}><Glyph name="back" /> {COPY.C044_BACK}</span></div>
      <div className="detail">
        <div className="limg"><div className={`big tile ${v.cls}`} style={{ height: "100%", overflow: "hidden" }}><ProductMedia product={p} /></div></div>
        <div className="rcol">
          <div className="nm">{p.name}</div>
          <div className="price pz">{yuan(lineTotal)}{soldOut && <span className="pill amber" style={{ marginLeft: 10 }}>{COPY.C046_SOLD_OUT}</span>}</div>

          {p.colors.length > 0 && (
            <div className="blk">
              <div className="lab">颜色</div>
              <div className="opts">
                {p.colors.map((c) => (
                  <div key={c} className={`opt${c === color ? " sel" : ""}`} onClick={() => setColor(c)}>{c}</div>
                ))}
              </div>
            </div>
          )}
          {p.capacities.length > 0 && (
            <div className="blk">
              <div className="lab">容量</div>
              <div className="opts">
                {p.capacities.map((c) => (
                  <div key={c} className={`opt${c === cap ? " sel" : ""}`} onClick={() => setCap(c)}>{c}</div>
                ))}
              </div>
            </div>
          )}

          <div className="blk">
            <div className="lab">数量</div>
            <div className="stepper">
              <button className={qty <= 1 ? "dim" : ""} onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
              <span className="n">{qty}</span>
              <button className={qty >= 5 ? "dim" : ""} onClick={() => setQty((q) => Math.min(5, q + 1))}>+</button>
            </div>
          </div>

          <div className="blk"><div className="lab">{p.deliveryNote ?? "标准配送"}</div></div>

          <div className="actions">
            <GatedButton className="btn ghost" action={buyNow} disabled={soldOut}>{COPY.C020_BUY_NOW}</GatedButton>
            <GatedButton className="btn" action={() => add({ productCode: p.productCode, color, capacity: cap, qty })} disabled={soldOut}>
              {COPY.C021_ADD_CART}
            </GatedButton>
          </div>
        </div>
      </div>
    </main>
  );
}
