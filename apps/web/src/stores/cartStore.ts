import { create } from "zustand";
import type { CartItem } from "@apex/shared";
import { ERR, COPY } from "@apex/shared";
import { api } from "../lib/api";
import { useUiStore } from "./uiStore";

interface CartState {
  items: CartItem[];
  selectedTotalCents: number;
  count: number;
  fetch: () => Promise<void>;
  add: (body: { productCode: string; color?: string; capacity?: string; qty?: number }) => Promise<void>;
  setQty: (itemId: string, qty: number) => Promise<void>;
  toggle: (itemId: string, selected: boolean) => Promise<void>;
  remove: (itemId: string) => Promise<void>;
  clearLocal: () => void;
}

export const useCartStore = create<CartState>((set) => {
  const apply = (data: { items: CartItem[]; selectedTotalCents: number }) =>
    set({
      items: data.items,
      selectedTotalCents: data.selectedTotalCents,
      count: data.items.reduce((s, i) => s + i.qty, 0),
    });

  return {
    items: [],
    selectedTotalCents: 0,
    count: 0,
    fetch: async () => {
      const env = await api.cart();
      if (env.code === ERR.OK) apply(env.data);
    },
    add: async (body) => {
      const env = await api.addCart(body);
      if (env.code === ERR.OK) {
        apply(env.data);
        useUiStore.getState().toast(env.data.message ?? COPY.C005_ADDED);
      } else {
        useUiStore.getState().toast(env.message);
      }
    },
    setQty: async (itemId, qty) => {
      const env = await api.setQty(itemId, qty);
      if (env.code === ERR.OK) apply(env.data);
    },
    toggle: async (itemId, selected) => {
      const env = await api.toggle(itemId, selected);
      if (env.code === ERR.OK) apply(env.data);
    },
    remove: async (itemId) => {
      const env = await api.removeItem(itemId);
      if (env.code === ERR.OK) apply(env.data);
    },
    clearLocal: () => set({ items: [], selectedTotalCents: 0, count: 0 }),
  };
});
