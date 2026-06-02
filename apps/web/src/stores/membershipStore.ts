import { create } from "zustand";
import type { Membership } from "@apex/shared";
import { ERR } from "@apex/shared";
import { api } from "../lib/api";

interface MembershipState {
  status: Membership["status"];
  data: Membership;
  fetch: () => Promise<void>;
  clearLocal: () => void;
}

export const useMembershipStore = create<MembershipState>((set) => ({
  status: "INACTIVE",
  data: { status: "INACTIVE" },
  fetch: async () => {
    const env = await api.membership();
    if (env.code === ERR.OK) set({ data: env.data, status: env.data.status });
  },
  clearLocal: () => set({ status: "INACTIVE", data: { status: "INACTIVE" } }),
}));
