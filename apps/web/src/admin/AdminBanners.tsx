import { useEffect, useState } from "react";
import type { Banner } from "@apex/shared";
import { ERR } from "@apex/shared";
import { api } from "../lib/api";
import { FormModal, type Field, type FormValues } from "./FormModal";

const fields: Field[] = [
  { key: "title", label: "标题", type: "text" },
  { key: "subtitle", label: "副标题", type: "text" },
  { key: "targetProductCode", label: "跳转目标（商品编码）", type: "text", placeholder: "phy_car_001" },
  { key: "sortOrder", label: "排序", type: "number" },
];

export function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [editing, setEditing] = useState<Banner | "new" | null>(null);
  const [err, setErr] = useState("");

  const load = () => api.adminBanners().then((env) => env.code === ERR.OK && setBanners(env.data));
  useEffect(() => { load(); }, []);

  const toggle = async (b: Banner) => { const e = await api.adminBannerShelf(b.bannerCode, !b.published); if (e.code === ERR.OK) load(); };
  const open = (b: Banner | "new") => { setErr(""); setEditing(b); };

  async function submit(v: FormValues) {
    const body = { title: v.title, subtitle: v.subtitle, targetProductCode: v.targetProductCode, sortOrder: v.sortOrder === "" ? undefined : Number(v.sortOrder) };
    const res = editing === "new" ? await api.adminCreateBanner(body) : await api.adminUpdateBanner((editing as Banner).bannerCode, body);
    if (res.code !== ERR.OK) { setErr(res.message); return; }
    setEditing(null); load();
  }

  const initial: FormValues = editing && editing !== "new"
    ? { title: editing.title, subtitle: editing.subtitle, targetProductCode: editing.targetProductCode, sortOrder: editing.sortOrder }
    : { title: "", subtitle: "", targetProductCode: "", sortOrder: "" };

  return (
    <main className="acontent">
      <div className="ah"><h2>Banner 管理</h2><span className="sp" />
        <button className="btn" style={{ height: 36, padding: "0 16px", fontSize: 13 }} onClick={() => open("new")}>+ 新增 Banner</button>
      </div>
      <div className="tablewrap">
        <table className="tb">
          <thead><tr><th>编码</th><th>标题</th><th>副标题</th><th>跳转目标</th><th>排序</th><th>上架</th><th>操作</th></tr></thead>
          <tbody>
            {banners.map((b) => (
              <tr key={b.bannerCode}>
                <td className="mono">{b.bannerCode}</td>
                <td>{b.title}</td>
                <td style={{ color: "var(--ink2)" }}>{b.subtitle}</td>
                <td className="mono">{b.targetProductCode}</td>
                <td className="mono">{b.sortOrder}</td>
                <td><span className={`sw${b.published ? " on" : ""}`} onClick={() => toggle(b)}><i /></span></td>
                <td><button className="linkbtn" onClick={() => open(b)}>编辑</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing && (
        <FormModal
          title={editing === "new" ? "新增 Banner" : `编辑 Banner · ${(editing as Banner).bannerCode}`}
          fields={fields}
          initial={initial}
          error={err}
          onCancel={() => setEditing(null)}
          onSubmit={submit}
        />
      )}
    </main>
  );
}
