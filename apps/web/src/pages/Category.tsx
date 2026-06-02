import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { Category as Cat, Product } from "@apex/shared";
import { ERR, COPY } from "@apex/shared";
import { api } from "../lib/api";
import { yuan } from "../lib/money";
import { productPath } from "../lib/paths";
import { Glyph, typeVisual } from "../components/icons";

export function Category() {
  const nav = useNavigate();
  const [sp, setSp] = useSearchParams();
  const [cats, setCats] = useState<Cat[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const active = sp.get("cat") ?? "";

  useEffect(() => {
    api.categories().then((env) => {
      if (env.code === ERR.OK) {
        setCats(env.data);
        if (!active && env.data[0]) setSp({ cat: env.data[0].categoryCode }, { replace: true });
      }
    });
  }, []);

  useEffect(() => {
    if (active) api.categoryProducts(active).then((env) => env.code === ERR.OK && setProducts(env.data.products));
  }, [active]);

  return (
    <main className="main">
      <div className="phead"><span className="ptitle">分类</span></div>
      <div style={{ display: "flex", gap: 16, flex: 1, minHeight: 0 }}>
        <div style={{ flex: "0 0 200px", display: "flex", flexDirection: "column", gap: 8 }}>
          {cats.map((c) => (
            <div key={c.categoryCode} className={`cat${c.categoryCode === active ? " on" : ""}`}
              onClick={() => setSp({ cat: c.categoryCode })}>
              <Glyph name={typeVisual(c.type).icon} />
              <span className="cn">{c.name}</span>
            </div>
          ))}
        </div>
        <div className="scroll" style={{ flex: 1 }}>
          <div className="glist" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
            {products.map((p) => {
              const v = typeVisual(p.type, p.category);
              return (
                <div key={p.productCode} className="scard" onClick={() => nav(productPath(p))}>
                  <div className={`tile stile ${v.cls}`}><Glyph name={v.icon} /></div>
                  <div className="sinfo">
                    <div className="nm">{p.name}</div>
                    <div className="mt">{p.type === "DISPLAY_SERVICE" ? "服务展示" : p.colors[0] ?? ""}</div>
                    <div className="pr">
                      <span className="price">{yuan(p.priceCents)}</span>
                      {p.stock === "SOLD_OUT" && <span className="pill amber">{COPY.C046_SOLD_OUT}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
