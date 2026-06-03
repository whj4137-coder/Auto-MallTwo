import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { UserInfo } from "@apex/shared";
import { COPY, ERR } from "@apex/shared";
import { api } from "../lib/api";
import { yuan } from "../lib/money";
import { Glyph } from "../components/icons";
import { GatedButton } from "../components/gate/GatedButton";
import { useCartStore } from "../stores/cartStore";
import { useSessionStore } from "../stores/sessionStore";
import { useUiStore } from "../stores/uiStore";

export function Cart() {
  const nav = useNavigate();
  const { items, selectedTotalCents, fetch, setQty, toggle, remove } = useCartStore();
  const auth = useSessionStore((s) => s.auth);
  const drive = useSessionStore((s) => s.drive);
  const net = useSessionStore((s) => s.net);
  const toast = useUiStore((s) => s.toast);
  const [user, setUser] = useState<UserInfo | null>(null);
  // §15.9.7 行车/断网下购物车为只读：勾选/改量/删除置灰禁用（非 toast 拦截）
  const readonly = drive === "DRIVING" || net === "OFFLINE";

  useEffect(() => {
    if (auth === "GUEST") useUiStore.getState().openLogin(() => fetch());
    else { fetch(); api.me().then((env) => env.code === ERR.OK && setUser(env.data)); }
  }, [auth]);

  const checkout = () =>
    api.createCheckout({ source: "CART" }).then((env) => {
      if (env.code === ERR.OK) nav(`/confirm/${env.data.checkoutId}`);
      else toast(env.message);
    });

  if (items.length === 0) {
    return (
      <main className="main">
        <div className="phead"><span className="ptitle">购物车</span></div>
        <div className="empty">
          <div className="ec"><Glyph name="cart" /></div>
          <div>{COPY.C012_CART_EMPTY}</div>
          <button className="btn ghost" onClick={() => nav("/")}>{COPY.C040_CART_EMPTY_BTN}</button>
        </div>
      </main>
    );
  }

  return (
    <main className="main">
      <div className="phead"><span className="ptitle">购物车</span></div>
      <div className="ls">
        <div className="left scroll">
          {items.map((i) => {
            const unavailable = !i.published ? COPY.C049_DELISTED_TAG : i.stock === "SOLD_OUT" ? COPY.C046_SOLD_OUT : null;
            return (
            <div key={i.itemId} className="card" style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, marginBottom: 10 }}>
              <span className={`sw${i.selected ? " on" : ""}${readonly ? " dis" : ""}`} onClick={() => { if (!readonly) toggle(i.itemId, !i.selected); }}><i /></span>
              <div className="tile stile t-car" style={{ width: 44, height: 44 }}><Glyph name="box" /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{i.name}{unavailable && <span className="pill amber" style={{ marginLeft: 8 }}>{unavailable}</span>}</div>
                <div style={{ fontSize: 11, color: "var(--ink3)" }}>{[i.color, i.capacity].filter(Boolean).join(" / ")}</div>
              </div>
              <div className={`stepper${readonly ? " dis" : ""}`}>
                <button className={i.qty <= 1 || readonly ? "dim" : ""} onClick={() => { if (!readonly) setQty(i.itemId, Math.max(1, i.qty - 1)); }}>−</button>
                <span className="n">{i.qty}</span>
                <button className={i.qty >= 5 || readonly ? "dim" : ""} onClick={() => { if (!readonly) setQty(i.itemId, Math.min(5, i.qty + 1)); }}>+</button>
              </div>
              <span className="price" style={{ width: 80, textAlign: "right" }}>{yuan(i.unitPriceCents * i.qty)}</span>
              <span className={`linkbtn${readonly ? " dis" : ""}`} onClick={() => { if (!readonly) remove(i.itemId); }}>删除</span>
            </div>
            );
          })}
        </div>
        <div className="right">
          <div className="card summary">
            <h3>订单摘要</h3>
            <div className="sline">商品合计<span className="v">{yuan(selectedTotalCents)}</span></div>
            <div className="sline">配送方式<span className="v">标准配送</span></div>
            <div className="sline">收货地址<span className="v">{user?.receiver.name ?? "—"}</span></div>
            <div className="stotal">合计<span className="price">{yuan(selectedTotalCents)}</span></div>
            <GatedButton className="btn block" action={checkout} disabled={selectedTotalCents === 0}>{COPY.C025_CHECKOUT}</GatedButton>
          </div>
        </div>
      </div>
    </main>
  );
}
