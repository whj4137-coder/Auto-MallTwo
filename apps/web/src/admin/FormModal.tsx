import { useState } from "react";
import { COPY } from "@apex/shared";

export type Field =
  | { key: string; label: string; type: "text" | "number" | "csv"; placeholder?: string; readOnly?: boolean }
  | { key: string; label: string; type: "select"; options: { value: string; label: string }[] }
  | { key: string; label: string; type: "checkbox" };

export type FormValues = Record<string, string | number | boolean>;

// 通用 Admin 表单弹窗（复用 .scrim/.dialog/.field）。父级给字段规格 + 初值，提交回传原始表单值，父级转 API body。
export function FormModal({
  title, fields, initial, error, onCancel, onSubmit,
}: {
  title: string;
  fields: Field[];
  initial: FormValues;
  error?: string;
  onCancel: () => void;
  onSubmit: (values: FormValues) => void;
}) {
  const [values, setValues] = useState<FormValues>(initial);
  const set = (k: string, v: string | boolean) => setValues((s) => ({ ...s, [k]: v }));

  return (
    <div className="scrim">
      <div className="dialog" style={{ width: 520, maxHeight: "86%", overflowY: "auto" }}>
        <div className="dh"><div className="dt">{title}</div><div className="x" onClick={onCancel}>×</div></div>
        <div style={{ marginTop: 14 }}>
          {fields.map((f) => (
            <div className="field" key={f.key}>
              <label>{f.label}</label>
              {f.type === "select" ? (
                <select className="fsel" style={{ width: "100%", height: 46 }} value={String(values[f.key] ?? "")}
                  onChange={(e) => set(f.key, e.target.value)}>
                  {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ) : f.type === "checkbox" ? (
                <span className={`sw${values[f.key] ? " on" : ""}`} onClick={() => set(f.key, !values[f.key])}><i /></span>
              ) : (
                <input
                  type={f.type === "number" ? "number" : "text"}
                  value={String(values[f.key] ?? "")}
                  placeholder={"placeholder" in f ? f.placeholder : undefined}
                  readOnly={"readOnly" in f ? f.readOnly : false}
                  onChange={(e) => set(f.key, e.target.value)}
                />
              )}
            </div>
          ))}
          {error && <div className="err">{error}</div>}
          <div className="acts">
            <button className="btn ghost" onClick={onCancel}>{COPY.C019_LOGIN_CANCEL}</button>
            <button className="btn" onClick={() => onSubmit(values)}>保存</button>
          </div>
        </div>
      </div>
    </div>
  );
}
