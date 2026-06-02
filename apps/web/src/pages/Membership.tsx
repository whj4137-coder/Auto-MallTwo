import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Product } from "@apex/shared";
import { ERR, COPY } from "@apex/shared";
import { api } from "../lib/api";
import { yuan } from "../lib/money";
import { Glyph } from "../components/icons";
import { GatedButton } from "../components/gate/GatedButton";
import { useMembershipStore } from "../stores/membershipStore";
import { useUiStore } from "../stores/uiStore";

export function Membership() {
  const { code } = useParams();
  const nav = useNavigate();
  const [p, setP] = useState<Product | null>(null);
  const status = useMembershipStore((s) => s.status);
  const toast = useUiStore((s) => s.toast);

  useEffect(() => {
    if (code) api.product(code).then((env) => env.code === ERR.OK && setP(env.data));
  }, [code]);
  useEffect(() => { useMembershipStore.getState().fetch(); }, []);

  if (!p) return <main className="main"><div className="empty">加载中…</div></main>;
  const active = status === "ACTIVE";

  const activate = () =>
    api.createCheckout({ source: "BUY_NOW", productCode: p.productCode }).then((env) => {
      if (env.code === ERR.OK) nav(`/confirm/${env.data.checkoutId}`);
      else toast(env.message);
    });

  return (
    <main className="main">
      <div className="phead"><span className="back" onClick={() => nav(-1)}><Glyph name="back" /> {COPY.C044_BACK}</span></div>
      <div className="detail">
        <div className="limg">
          <div className="big" style={{ height: "100%", background: "linear-gradient(135deg,#22D3C5,#0E7490)", borderRadius: 14, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 24, color: "#04201c" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 12, letterSpacing: 2 }}>APEX MEMBERSHIP</div>
            <div>
              <div style={{ fontFamily: "var(--disp)", fontWeight: 700, fontSize: 26 }}>{p.name}</div>
              <div style={{ fontSize: 13, opacity: .85, marginTop: 4 }}>{p.boundVehicle} · 有效期 {p.validDays} 天</div>
            </div>
          </div>
        </div>
        <div className="rcol">
          <div className="nm">{p.name}</div>
          <div className="price pz">{yuan(p.priceCents)}</div>
          <div className="blk">
            <div className="lab">会员权益</div>
            {(p.benefits ?? []).map((b) => (
              <div key={b} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8, fontSize: 14 }}>
                <span style={{ color: "var(--teal)" }}><Glyph name="check" cls="" /></span>{b}
              </div>
            ))}
          </div>
          <div className="blk"><div className="lab">绑定车辆</div><div style={{ fontSize: 14 }}>{p.boundVehicle}</div></div>
          <div className="actions">
            {active ? (
              <button className="btn" onClick={() => nav("/orders")}>{COPY.C023_ACTIVATED}</button>
            ) : (
              <GatedButton className="btn" action={activate}>{COPY.C022_ACTIVATE}</GatedButton>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
