import { create } from "zustand";
import type { AuthState, DriveState, NetState, UserInfo } from "@apex/shared";

interface SessionState {
  auth: AuthState;
  drive: DriveState;
  net: NetState;
  token: string | null;
  user: UserInfo | null;
  setDrive: (d: DriveState) => void;
  setNet: (n: NetState) => void;
  loginSuccess: (token: string, user: UserInfo) => void;
  logout: () => void;
  resetSession: () => void;
}

// 三态仅由 DemoBar 切换，绝不自动触发。登录态仅内存，重置回 GUEST/PARKED/ONLINE。
export const useSessionStore = create<SessionState>((set) => ({
  auth: "GUEST",
  drive: "PARKED",
  net: "ONLINE",
  token: null,
  user: null,
  setDrive: (drive) => set({ drive }),
  setNet: (net) => set({ net }),
  loginSuccess: (token, user) => set({ token, user, auth: "LOGGED_IN" }),
  logout: () => set({ token: null, auth: "GUEST" }),
  resetSession: () => set({ auth: "GUEST", drive: "PARKED", net: "ONLINE", token: null }),
}));
