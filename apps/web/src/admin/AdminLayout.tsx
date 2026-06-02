import { NavLink, Outlet, Navigate } from "react-router-dom";
import { Glyph } from "../components/icons";
import { useAdminStore } from "../stores/adminStore";

export function AdminLayout() {
  const token = useAdminStore((s) => s.token);
  if (!token) return <Navigate to="/admin/login" replace />;

  return (
    <div className="device">
      <div className="atop">
        <span className="badge">DEMO</span>
        <span className="brand">APEX <b>DRIVE</b> STORE · ADMIN</span>
        <span className="who">运营 · <b>admin</b></span>
      </div>
      <div className="body">
        <nav className="anav">
          <div className="grp">CATALOG</div>
          <NavLink to="/admin/products" className={({ isActive }) => (isActive ? "on" : "")}>
            <Glyph name="grid" />商品管理
          </NavLink>
          <NavLink to="/admin/banners" className={({ isActive }) => (isActive ? "on" : "")}>
            <Glyph name="box" />Banner 管理
          </NavLink>
          <NavLink to="/admin/services" className={({ isActive }) => (isActive ? "on" : "")}>
            <Glyph name="star" />服务内容
          </NavLink>
          <div className="grp">OPS</div>
          <NavLink to="/admin/orders" className={({ isActive }) => (isActive ? "on" : "")}>
            <Glyph name="doc" />订单管理
          </NavLink>
          <NavLink to="/admin/session" className={({ isActive }) => (isActive ? "on" : "")}>
            <Glyph name="bolt" />演示会话
          </NavLink>
          <div className="grp">ACCOUNT</div>
          <NavLink to="/admin/account" className={({ isActive }) => (isActive ? "on" : "")}>
            <Glyph name="user" />账号信息
          </NavLink>
        </nav>
        <Outlet />
      </div>
    </div>
  );
}
