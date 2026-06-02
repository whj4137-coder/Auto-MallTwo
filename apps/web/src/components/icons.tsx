// 精简图标集（stroke=currentColor，由父级 svg 样式控制）。
const P = (d: string) => <path d={d} />;

export const Icons: Record<string, JSX.Element> = {
  home: P("M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"),
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  cart: (
    <>
      <circle cx="9" cy="20" r="1.4" />
      <circle cx="18" cy="20" r="1.4" />
      <path d="M3 4h2l2.2 11.2a1 1 0 0 0 1 .8h8.6a1 1 0 0 0 1-.8L21 8H6" />
    </>
  ),
  doc: (
    <>
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
      <path d="M9 8h6M9 12h6" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4-4" />
    </>
  ),
  mic: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </>
  ),
  star: P("M12 3l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 20l-4.8 2.5.9-5.4L4.2 8.7l5.4-.8z"),
  bolt: P("M13 2L4 14h6l-1 8 9-12h-6z"),
  box: (
    <>
      <path d="M3 7l9-4 9 4-9 4-9-4z" />
      <path d="M3 7v10l9 4 9-4V7" />
    </>
  ),
  phone: (
    <>
      <rect x="7" y="2" width="10" height="20" rx="2.5" />
      <path d="M11 18h2" />
    </>
  ),
  camera: (
    <>
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <circle cx="12" cy="12.5" r="3.4" />
    </>
  ),
  charger: (
    <>
      <rect x="6" y="3" width="12" height="18" rx="2" />
      <path d="M10 8l3 0M10 12h4" />
    </>
  ),
  scent: (
    <>
      <path d="M9 3h6v3l2 2v13H7V8l2-2z" />
      <path d="M10 13h4" />
    </>
  ),
  back: P("M15 6l-6 6 6 6"),
  check: P("M5 12l4 4 10-10"),
};

export function Glyph({ name, cls = "" }: { name: string; cls?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth={1.6}>
      {Icons[name] ?? Icons.box}
    </svg>
  );
}

// 商品类型 → tile 视觉类 + 图标
export function typeVisual(type: string, category?: string): { cls: string; vcls: string; icon: string } {
  if (type === "MEMBERSHIP") return { cls: "t-mem", vcls: "v-mem", icon: "star" };
  if (type === "DISPLAY_SERVICE")
    return { cls: "t-svc", vcls: "v-svc", icon: category === "cat_charging" ? "bolt" : "scent" };
  if (category === "cat_electronics") return { cls: "t-ele", vcls: "v-ele", icon: "camera" };
  return { cls: "t-car", vcls: "v-car", icon: "box" };
}
