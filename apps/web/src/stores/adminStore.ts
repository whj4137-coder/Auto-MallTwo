import { create } from "zustand";

interface AdminState {
  token: string | null;
  setToken: (t: string) => void;
  clear: () => void;
}

// Admin 登录态（独立于前台 session）。
export const useAdminStore = create<AdminState>((set) => ({
  token: null,
  setToken: (token) => set({ token }),
  clear: () => set({ token: null }),
}));
