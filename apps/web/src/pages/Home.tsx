import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { HomeData, Product } from "@apex/shared";
import { ERR, COPY } from "@apex/shared";
import { api } from "../lib/api";
import { yuan } from "../lib/money";
import { productPath } from "../lib/paths";
import { Glyph, typeVisual } from "../components/icons";
import { ProductMedia } from "../components/ProductMedia";
import { useUiStore } from "../stores/uiStore";

export function Home() {
  const nav = useNavigate();
  const [data, setData] = useState<HomeData | null>(null);
  const toast = useUiStore((s) => s.toast);

  useEffect(() => {
    api.home().then((env) => env.code === ERR.OK && setData(env.data));
  }, []);

  if (!data) return <main className="main"><div className="empty">加载中…</div></main>;

  const hero = data.banners[0];
  const promoCharge = data.banners.find((b) => b.bannerCode === "banner_002");
  const promoMem = data.banners.find((b) => b.bannerCode === "banner_003");
  const go = (p: Pick<Product, "productCode" | "type">) => nav(productPath(p));
  const goTarget = (code: string) => {
    const p = [...data.featured, ...data.shelves.flatMap((s) => s.products)].find((x) => x.productCode === code);
    if (p) go(p);
  };

  return (
    <main className="main lpad">
      <div className="top pad-r">
        <span className="wm">Apex <b>Drive Store</b></span>
        <span className="tagchip">车机商城 · DEMO</span>
        <div className="search r" onClick={() => nav("/search")}>
          <Glyph name="search" />
          <span className="t">搜索车品、电子配件、会员…</span>
          <span className="mic" onClick={(e) => { e.stopPropagation(); toast(COPY.C004_VOICE); }}>
            <Glyph name="mic" />
          </span>
        </div>
      </div>

      <div className="bento pad-r">
        <div className="hero" onClick={() => hero && goTarget(hero.targetProductCode)} style={{ cursor: "pointer" }}>
          <span className="glow" /><span className="tick tl" /><span className="tick tr" /><span className="tick bl" /><span className="tick br" />
          <div className="l">
            <div className="kick">FEATURED</div>
            <div className="h1">{hero?.title}</div>
            <div className="sub">{hero?.subtitle}</div>
            <div><span className="btn">{COPY.C020_BUY_NOW} ¥129 →</span></div>
          </div>
          <div className="r"><div className="puck" style={{ width: 150, height: 116 }}><Glyph name="phone" cls="" /></div></div>
        </div>
        <div className="promos">
          <div className="promo pr-charge" onClick={() => promoCharge && goTarget(promoCharge.targetProductCode)}>
            <div className="pk">SERVICE</div>
            <div className="pt">{promoCharge?.title}</div>
            <div className="ps">{promoCharge?.subtitle}</div>
            <div className="pico"><Glyph name="bolt" /></div>
          </div>
          <div className="promo pr-mem" onClick={() => promoMem && goTarget(promoMem.targetProductCode)}>
            <div className="pk">MEMBER</div>
            <div className="pt">{promoMem?.title}</div>
            <div className="ps">{promoMem?.subtitle}</div>
            <div className="pico"><Glyph name="star" /></div>
          </div>
        </div>
      </div>

      <div className="cats pad-r">
        {data.categories.map((c) => (
          <div key={c.categoryCode} className="cat" onClick={() => nav(`/category?cat=${c.categoryCode}`)}>
            <Glyph name={typeVisual(c.type).icon} />
            <span className="cn">{c.name}</span>
            <span className="cc">{c.count}</span>
          </div>
        ))}
      </div>

      <div className="railwrap">
        <div className="sh pad-r" style={{ marginBottom: 8 }}>精选商品<span className="more">FEATURED</span></div>
        <div className="frail">
          {data.featured.map((p) => {
            const v = typeVisual(p.type, p.category);
            return (
              <div key={p.productCode} className="bigcard" onClick={() => go(p)}>
                <div className={`vis ${v.vcls}`} style={{ overflow: "hidden" }}><ProductMedia product={p} /></div>
                <div className="ft">
                  <div className="kk">{p.type === "MEMBERSHIP" ? "MEMBER" : "PHYSICAL"}</div>
                  <div className="nm">{p.name}</div>
                  <div className="pr"><span className="price">{yuan(p.priceCents)}</span><span className="go">查看 →</span></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="catzone">
        {data.shelves.map((s) => (
          <div key={s.category.categoryCode} className="csec">
            <div className="chead">{s.category.name}<span className="k">{s.category.categoryCode}</span><span className="cnt">{s.products.length} 件</span></div>
            <div className="glist">
              {s.products.map((p) => {
                const v = typeVisual(p.type, p.category);
                return (
                  <div key={p.productCode} className="scard" onClick={() => go(p)}>
                    <div className={`tile stile ${v.cls}`} style={{ overflow: "hidden" }}><ProductMedia product={p} /></div>
                    <div className="sinfo">
                      <div className="nm">{p.name}</div>
                      <div className="mt">{p.type === "DISPLAY_SERVICE" ? "服务展示" : p.colors[0] ?? "标准配送"}</div>
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
        ))}
      </div>
    </main>
  );
}
