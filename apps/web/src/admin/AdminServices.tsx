import { useEffect, useState } from "react";
import type { Product } from "@apex/shared";
import { ERR } from "@apex/shared";
import { api } from "../lib/api";
import { centsToYuanInput, yuan, yuanInputToCents } from "../lib/money";
import { FormModal, type Field, type FormValues } from "./FormModal";

export function AdminServices() {
  const [items, setItems] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [err, setErr] = useState("");

  const load = () => api.adminServices().then((env) => env.code === ERR.OK && setItems(env.data));
  useEffect(() => { load(); }, []);

  const toggle = async (p: Product) => { const e = await api.adminServiceShelf(p.productCode, !p.published); if (e.code === ERR.OK) load(); };
  const open = (p: Product) => { setErr(""); setEditing(p); };

  const isMem = (p: Product | null) => p?.type === "MEMBERSHIP";
  const fields: Field[] = editing && isMem(editing)
    ? [
        { key: "name", label: "名称", type: "text" },
        { key: "priceYuan", label: "价格（元）", type: "number" },
        { key: "validDays", label: "有效期（天）", type: "number" },
        { key: "benefits", label: "权益（逗号分隔）", type: "csv" },
      ]
    : [
        { key: "name", label: "名称", type: "text" },
        { key: "serviceDesc", label: "服务说明", type: "text" },
      ];

  async function submit(v: FormValues) {
    if (!editing) return;
    const body: Record<string, unknown> = { name: v.name };
    if (isMem(editing)) {
      body.priceCents = yuanInputToCents(v.priceYuan);
      body.validDays = v.validDays === "" ? undefined : Number(v.validDays);
      body.benefits = String(v.benefits ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    } else {
      body.serviceDesc = v.serviceDesc;
    }
    const res = await api.adminUpdateService(editing.productCode, body);
    if (res.code !== ERR.OK) { setErr(res.message); return; }
    setEditing(null); load();
  }

  const initial: FormValues = editing
    ? isMem(editing)
      ? { name: editing.name, priceYuan: centsToYuanInput(editing.priceCents), validDays: editing.validDays ?? "", benefits: (editing.benefits ?? []).join(", ") }
      : { name: editing.name, serviceDesc: editing.serviceDesc ?? "" }
    : {};

  const members = items.filter((p) => p.type === "MEMBERSHIP");
  const services = items.filter((p) => p.type === "DISPLAY_SERVICE");

  const Table = ({ rows, kind }: { rows: Product[]; kind: "mem" | "svc" }) => (
    <div className="tablewrap" style={{ flex: "none", marginBottom: 14 }}>
      <table className="tb">
        <thead><tr><th>编码</th><th>名称</th>{kind === "mem" ? <><th>价格</th><th>有效期</th><th>权益</th></> : <><th>类目</th><th>说明</th></>}<th>上架</th><th>操作</th></tr></thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.productCode}>
              <td className="mono">{p.productCode}</td>
              <td>{p.name}</td>
              {kind === "mem" ? (
                <><td className="amt">{yuan(p.priceCents)}</td><td className="mono">{p.validDays} 天</td><td style={{ color: "var(--ink2)" }}>{(p.benefits ?? []).join(" / ")}</td></>
              ) : (
                <><td className="mono">{p.category}</td><td style={{ color: "var(--ink2)" }}>{p.serviceDesc}</td></>
              )}
              <td><span className={`sw${p.published ? " on" : ""}`} onClick={() => toggle(p)}><i /></span></td>
              <td><button className="linkbtn" onClick={() => open(p)}>编辑</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <main className="acontent">
      <div className="ah"><h2>服务内容管理</h2></div>
      <div className="scroll" style={{ display: "flex", flexDirection: "column" }}>
        <div className="sh" style={{ marginBottom: 8 }}>会员服务<span className="more">MEMBERSHIP</span></div>
        <Table rows={members} kind="mem" />
        <div className="sh" style={{ marginBottom: 8 }}>展示服务<span className="more">DISPLAY · 不可交易</span></div>
        <Table rows={services} kind="svc" />
      </div>
      {editing && (
        <FormModal
          title={`编辑 · ${editing.productCode}`}
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
