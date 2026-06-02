// 状态枚举 — 源自 PRD §10.7。前后端唯一引用源。

export type ProductType = "PHYSICAL" | "MEMBERSHIP" | "DISPLAY_SERVICE";
export type AuthState = "GUEST" | "LOGGED_IN";
export type DriveState = "PARKED" | "DRIVING";
export type NetState = "ONLINE" | "OFFLINE";
export type CheckoutSource = "CART" | "BUY_NOW";
export type MembershipStatus = "INACTIVE" | "ACTIVE";
export type Stock = "IN_STOCK" | "SOLD_OUT";
export type OrderStatus = "PAID" | "ACTIVATED"; // 实物 已支付 / 会员 已开通

export const CATEGORY_TYPE: Record<string, ProductType> = {
  cat_car_goods: "PHYSICAL",
  cat_electronics: "PHYSICAL",
  cat_membership: "MEMBERSHIP",
  cat_charging: "DISPLAY_SERVICE",
  cat_life: "DISPLAY_SERVICE",
};
