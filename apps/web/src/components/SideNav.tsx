import { NavLink } from "react-router-dom";
import { Glyph } from "./icons";

const items = [
  { to: "/", label: "首页", icon: "home", end: true },
  { to: "/category", label: "分类", icon: "grid" },
  { to: "/cart", label: "购物车", icon: "cart" },
  { to: "/orders", label: "订单", icon: "doc" },
  { to: "/mine", label: "我的", icon: "user" },
];

export function SideNav() {
  return (
    <nav className="nav">
      <div className="logo">APEX</div>
      {items.map((it) => (
        <NavLink key={it.to} to={it.to} end={it.end} className={({ isActive }) => (isActive ? "on" : "")}>
          <span className="ic"><Glyph name={it.icon} /></span>
          {it.label}
        </NavLink>
      ))}
    </nav>
  );
}
