import type { Product, Category, Banner, CartItem, Checkout, Order, Membership, UserInfo } from "@apex/shared";
import { SEED_PRODUCTS, SEED_CATEGORIES, SEED_BANNERS, SEED_USER } from "./seed.js";
import { OrderSequencer } from "./sequencer.js";

// 进程内存储。种子内容(商品/类目/Banner)由 Admin 持久化编辑；会话数据(cart/checkout/orders/membership)可被 Demo 重置。

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

export class InMemoryStore {
  // 内容数据（Admin 可改，Demo 重置不还原）
  products: Product[] = clone(SEED_PRODUCTS);
  categories: Category[] = clone(SEED_CATEGORIES);
  banners: Banner[] = clone(SEED_BANNERS);
  user: UserInfo = clone(SEED_USER);

  // 会话数据（Demo 重置清空）
  cart: CartItem[] = [];
  checkouts = new Map<string, Checkout>();
  checkoutCartItemIds = new Map<string, string[]>(); // CART 来源 checkout → 关联购物车项，支付后删除
  orders: Order[] = [];
  membership: Membership = { status: "INACTIVE" };
  seq = new OrderSequencer();
  tokens = new Set<string>();

  getProduct(code: string): Product | undefined {
    return this.products.find((p) => p.productCode === code);
  }

  resetSession(): void {
    this.cart = [];
    this.checkouts.clear();
    this.checkoutCartItemIds.clear();
    this.orders = [];
    this.membership = { status: "INACTIVE" };
    this.seq.reset();
    this.tokens.clear();
  }

  // 测试隔离用：连同 Admin 可改的内容（商品/Banner/用户）一并复位到种子。生产 Demo 重置走 resetSession（保留内容编辑）。
  resetAll(): void {
    this.products = clone(SEED_PRODUCTS);
    this.categories = clone(SEED_CATEGORIES);
    this.banners = clone(SEED_BANNERS);
    this.user = clone(SEED_USER);
    this.resetSession();
  }
}

export const store = new InMemoryStore();
