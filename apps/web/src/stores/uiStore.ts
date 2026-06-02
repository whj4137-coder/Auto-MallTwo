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

// toast 单条优先级由调用方保证（门禁只抛最高优先级一条）。
export const useUiStore = create<UiState>((set, get) => ({
  toasts: [],
  loginOpen: false,
  pendingAction: null,
  toast: (text) => {
    const id = ++seq;
    set((s) => ({ toasts: [...s.toasts, { id, text }] }));
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
