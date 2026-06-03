import { create } from "zustand";

interface ToastItem { id: number; text: string }

interface UiState {
  toasts: ToastItem[];
  loginOpen: boolean;
  pendingAction: (() => void) | null;
  toast: (text: string) => void;
  dismiss: (id: number) => void;
  openLogin: (pending?: () => void) => void;
  closeLogin: () => void;
  takePending: () => (() => void) | null;
}

let seq = 0;

// §15.9.1 Toast：同时刻只显一条，后到覆盖前一条（优先级由门禁只抛最高一条保证）。
export const useUiStore = create<UiState>((set, get) => ({
  toasts: [],
  loginOpen: false,
  pendingAction: null,
  toast: (text) => {
    const id = ++seq;
    set({ toasts: [{ id, text }] }); // 覆盖式：仅保留最新一条
    setTimeout(() => get().dismiss(id), 2500);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  openLogin: (pending) => set({ loginOpen: true, pendingAction: pending ?? null }),
  closeLogin: () => set({ loginOpen: false }),
  takePending: () => {
    const p = get().pendingAction;
    set({ pendingAction: null });
    return p;
  },
}));
