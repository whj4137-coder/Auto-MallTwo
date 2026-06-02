import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { Category as Cat, Product } from "@apex/shared";
import { ERR, COPY } from "@apex/shared";
import { api } from "../lib/api";
import { yuan } from "../lib/money";
import { productPath } from "../lib/paths";
import { Glyph, typeVisual } from "../components/icons";
import { ProductMedia } from "../components/ProductMedia";

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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12, paddingRight: 4 }}>
            {products.map((p) => {
              const v = typeVisual(p.type, p.category);
              const kk = p.type === "MEMBERSHIP" ? "MEMBER" : p.type === "DISPLAY_SERVICE" ? "SERVICE" : "PHYSICAL";
              const meta = p.type === "DISPLAY_SERVICE" ? "服务展示"
                : p.type === "MEMBERSHIP" ? `有效期 ${p.validDays} 天`
                : (p.colors.join(" / ") || "标准配送");
              return (
                <div key={p.productCode} className="bigcard" style={{ width: "100%", height: 150 }}
                  onClick={() => nav(productPath(p))}>
                  <div className={`vis ${v.vcls}`} style={{ flex: "0 0 132px", overflow: "hidden" }}><ProductMedia product={p} /></div>
                  <div className="ft">
                    <div className="kk">{kk}</div>
                    <div className="nm">{p.name}</div>
                    <div style={{ fontSize: 11, color: "var(--ink3)", margin: "0 0 8px" }}>{meta}</div>
                    <div className="pr">
                      <span className="price">{yuan(p.priceCents)}</span>
                      {p.stock === "SOLD_OUT"
                        ? <span className="pill amber">{COPY.C046_SOLD_OUT}</span>
                        : <span className="go">查看详情 →</span>}
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
