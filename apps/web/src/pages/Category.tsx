import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { Product } from "@apex/shared";
import { ERR, COPY } from "@apex/shared";
import { api } from "../lib/api";
import { useLoad } from "../lib/useLoad";
import { yuan } from "../lib/money";
import { productPath } from "../lib/paths";
import { Glyph, typeVisual } from "../components/icons";
import { ProductMedia } from "../components/ProductMedia";
import { PageFallback } from "../components/PageFallback";

export function Category() {
  const nav = useNavigate();
  const [sp, setSp] = useSearchParams();
  const active = sp.get("cat") ?? "";
  // 类目列表=页面骨架，失败/空可重试（§15.9.1）
  const { data: cats, status: catStatus, reload: reloadCats } = useLoad(() => api.categories(), []);
  // 右侧商品：按 active 加载；4004→notfound、空→COPY-048、错误→可重试（§15.9.3）
  const [products, setProducts] = useState<Product[] | null>(null);
  const [prodErr, setProdErr] = useState<"none" | "notfound" | "error">("none");

  useEffect(() => {
    if (cats && cats[0] && !active) setSp({ cat: cats[0].categoryCode }, { replace: true });
  }, [cats]);

  useEffect(() => {
    if (!active) return;
    setProducts(null);
    setProdErr("none");
    api.categoryProducts(active).then((env) => {
      if (env.code === ERR.OK) setProducts(env.data.products);
      else if (env.code === ERR.NOT_FOUND) setProdErr("notfound");
      else setProdErr("error");
    });
  }, [active]);

  if (catStatus !== "ok" || !cats) return <PageFallback status={catStatus} onRetry={reloadCats} />;

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
          {prodErr === "notfound" && <div className="empty"><div className="et">{COPY.C036_NOT_FOUND}</div></div>}
          {prodErr === "error" && (
            <div className="empty" style={{ gap: 14 }}>
              <div className="et">{COPY.C037_SERVER}</div>
              <button className="btn" onClick={() => setSp({ cat: active })}>{COPY.C047_RETRY}</button>
            </div>
          )}
          {prodErr === "none" && products && products.length === 0 && (
            <div className="empty" style={{ gap: 14 }}>
              <div className="et">{COPY.C048_CAT_EMPTY}</div>
              <button className="btn ghost" onClick={() => nav("/")}>{COPY.C027_HOME}</button>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12, paddingRight: 4 }}>
            {(products ?? []).map((p) => {
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
                      <span className="price">{p.type === "DISPLAY_SERVICE" ? "服务展示" : yuan(p.priceCents)}</span>
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
