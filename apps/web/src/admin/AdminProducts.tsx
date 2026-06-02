import { useEffect, useState } from "react";
import type { Product } from "@apex/shared";
import { ERR, COPY } from "@apex/shared";
import { api } from "../lib/api";
import { yuan } from "../lib/money";
import { FormModal, type Field, type FormValues } from "./FormModal";

const CATEGORIES = [
  { value: "cat_car_goods", label: "车品" },
  { value: "cat_electronics", label: "电子配件" },
  { value: "cat_membership", label: "会员服务" },
  { value: "cat_charging", label: "充电服务" },
  { value: "cat_life", label: "生活服务" },
];

const fields = (isNew: boolean): Field[] => [
  { key: "name", label: "名称", type: "text" },
  ...(isNew ? [{ key: "category", label: "类目", type: "select", options: CATEGORIES } as Field] : []),
  { key: "priceCents", label: "价格（分，如 12900=¥129；展示服务留空）", type: "number" },
  { key: "colors", label: "颜色 SKU（逗号分隔）", type: "csv", placeholder: "曜石黑, 银灰" },
  { key: "capacities", label: "容量 SKU（逗号分隔，可空）", type: "csv" },
  { key: "sortOrder", label: "排序", type: "number" },
  { key: "homeFeatured", label: "首页精选", type: "checkbox" },
];

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [err, setErr] = useState("");

  const load = () => api.adminProducts().then((env) => env.code === ERR.OK && setProducts(env.data));
  useEffect(() => { load(); }, []);

  const toggleShelf = async (p: Product) => { const e = await api.adminShelf(p.productCode, !p.published); if (e.code === ERR.OK) load(); };
  const toggleStock = async (p: Product) => { const e = await api.adminStock(p.productCode, p.stock === "IN_STOCK" ? "SOLD_OUT" : "IN_STOCK"); if (e.code === ERR.OK) load(); };

  const open = (p: Product | "new") => { setErr(""); setEditing(p); };

  async function submit(v: FormValues) {
    const body: Record<string, unknown> = {
      name: v.name,
      priceCents: v.priceCents === "" ? null : Number(v.priceCents),
      colors: String(v.colors ?? "").split(",").map((s) => s.trim()).filter(Boolean),
      capacities: String(v.capacities ?? "").split(",").map((s) => s.trim()).filter(Boolean),
      sortOrder: v.sortOrder === "" ? undefined : Number(v.sortOrder),
      homeFeatured: Boolean(v.homeFeatured),
    };
    const res = editing === "new"
      ? await api.adminCreateProduct({ ...body, category: v.category })
      : await api.adminUpdateProduct((editing as Product).productCode, body);
    if (res.code !== ERR.OK) { setErr(res.message); return; }
    setEditing(null); load();
  }

  const typeTag = (t: string) =>
    t === "MEMBERSHIP" ? <span className="tag memb">会员</span>
    : t === "DISPLAY_SERVICE" ? <span className="tag off">展示</span>
    : <span className="tag phys">实物</span>;

  const initial: FormValues = editing && editing !== "new"
    ? { name: editing.name, priceCents: editing.priceCents ?? "", colors: editing.colors.join(", "), capacities: editing.capacities.join(", "), sortOrder: editing.sortOrder, homeFeatured: editing.homeFeatured }
    : { name: "", category: "cat_car_goods", priceCents: "", colors: "", capacities: "", sortOrder: "", homeFeatured: false };

  return (
    <main className="acontent">
      <div className="ah"><h2>商品管理</h2><span className="sp" />
        <button className="btn" style={{ height: 36, padding: "0 16px", fontSize: 13 }} onClick={() => open("new")}>+ 新增商品</button>
      </div>
      <div className="tablewrap">
        <table className="tb">
          <thead><tr><th>编码</th><th>名称</th><th>类型</th><th>价格</th><th>库存</th><th>上架</th><th>操作</th></tr></thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.productCode}>
                <td className="mono">{p.productCode}</td>
                <td>{p.name}</td>
                <td>{typeTag(p.type)}</td>
                <td className="amt">{yuan(p.priceCents)}</td>
                <td>
                  {p.type === "DISPLAY_SERVICE" ? <span className="tag off">—</span> : (
                    <span className={`tag ${p.stock === "IN_STOCK" ? "on" : "sold"}`} style={{ cursor: "pointer" }} onClick={() => toggleStock(p)}>
                      {p.stock === "IN_STOCK" ? "库存充足" : COPY.C046_SOLD_OUT}
                    </span>
                  )}
                </td>
                <td><span className={`sw${p.published ? " on" : ""}`} onClick={() => toggleShelf(p)}><i /></span></td>
                <td><button className="linkbtn" onClick={() => open(p)}>编辑</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing && (
        <FormModal
          title={editing === "new" ? "新增商品" : `编辑商品 · ${(editing as Product).productCode}`}
          fields={fields(editing === "new")}
          initial={initial}
          error={err}
          onCancel={() => setEditing(null)}
          onSubmit={submit}
        />
      )}
    </main>
  );
}
