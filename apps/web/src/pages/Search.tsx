import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { Product } from "@apex/shared";
import { ERR, COPY } from "@apex/shared";
import { api } from "../lib/api";
import { yuan } from "../lib/money";
import { productPath } from "../lib/paths";
import { Glyph, typeVisual } from "../components/icons";
import { ProductMedia } from "../components/ProductMedia";
import { useSessionStore } from "../stores/sessionStore";
import { useUiStore } from "../stores/uiStore";

// 搜索（REQ-003）：商品名 substring，仅「实物+会员」（排除展示服务），仅已上架。
// 行车禁键盘显语音占位、断网禁用；空结果 COPY-014 + COPY-015 返回推荐。
export function Search() {
  const nav = useNavigate();
  const [sp, setSp] = useSearchParams();
  const q = sp.get("q") ?? "";
  const [results, setResults] = useState<Product[]>([]);
  const [searched, setSearched] = useState(false);
  const drive = useSessionStore((s) => s.drive);
  const net = useSessionStore((s) => s.net);
  const toast = useUiStore((s) => s.toast);
  const blocked = drive === "DRIVING" || net === "OFFLINE";

  useEffect(() => {
    const kw = q.trim();
    if (!kw) { setResults([]); setSearched(false); return; }
    api.search(kw).then((env) => { if (env.code === ERR.OK) { setResults(env.data); setSearched(true); } });
  }, [q]);

  const onInput = (v: string) => setSp(v ? { q: v } : {}, { replace: true });

  return (
    <main className="main">
      <div className="phead"><span className="ptitle">搜索</span></div>

      <div className="search" style={{ width: 420 }}>
        <Glyph name="search" />
        <input
          className="t"
          style={{ flex: 1, background: "transparent", border: 0, color: "var(--ink)", outline: "none", fontSize: 13 }}
          placeholder={drive === "DRIVING" ? "行车中请用语音…" : net === "OFFLINE" ? "网络不可用" : "搜索车品、电子配件、会员…"}
          value={q}
          disabled={blocked}
          onChange={(e) => onInput(e.target.value)}
        />
        <span className="mic" style={{ cursor: "pointer" }} onClick={() => toast(COPY.C004_VOICE)}><Glyph name="mic" /></span>
      </div>

      {!searched ? (
        <div className="empty"><div className="ec"><Glyph name="search" /></div><div>输入关键词搜索可购买商品（实物 / 会员）</div></div>
      ) : results.length === 0 ? (
        <div className="empty">
          <div className="ec"><Glyph name="search" /></div>
          <div>{COPY.C014_SEARCH_EMPTY}</div>
          <button className="btn ghost" onClick={() => nav("/")}>{COPY.C015_BACK_RECOMMEND}</button>
        </div>
      ) : (
        <div className="scroll" style={{ flex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12, paddingRight: 4 }}>
            {results.map((p) => {
              const v = typeVisual(p.type, p.category);
              const kk = p.type === "MEMBERSHIP" ? "MEMBER" : "PHYSICAL";
              const meta = p.type === "MEMBERSHIP" ? `有效期 ${p.validDays} 天` : (p.colors.join(" / ") || "标准配送");
              return (
                <div key={p.productCode} className="bigcard" style={{ width: "100%", height: 150 }} onClick={() => nav(productPath(p))}>
                  <div className={`vis ${v.vcls}`} style={{ flex: "0 0 132px", overflow: "hidden" }}><ProductMedia product={p} /></div>
                  <div className="ft">
                    <div className="kk">{kk}</div>
                    <div className="nm">{p.name}</div>
                    <div style={{ fontSize: 11, color: "var(--ink3)", margin: "0 0 8px" }}>{meta}</div>
                    <div className="pr">
                      <span className="price">{yuan(p.priceCents)}</span>
                      {p.stock === "SOLD_OUT" ? <span className="pill amber">{COPY.C046_SOLD_OUT}</span> : <span className="go">查看详情 →</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}
