import { Outlet } from "react-router-dom";
import { DemoBar } from "./DemoBar";
import { SideNav } from "./SideNav";
import { Toast } from "./Toast";
import { LoginDialog } from "./LoginDialog";

// 前台外壳：1280×720 device 画布 + Demo Bar + SideNav + 页面 Outlet。
export function FrontLayout() {
  return (
    <div className="device">
      <DemoBar />
      <div className="body">
        <SideNav />
        <Outlet />
      </div>
      <Toast />
      <LoginDialog />
    </div>
  );
}
