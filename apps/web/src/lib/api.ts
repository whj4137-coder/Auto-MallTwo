import { http } from "./http";
import type {
  HomeData, Product, Category, Order, Membership, UserInfo, Checkout, CartItem, Banner,
} from "@apex/shared";

type CartView = { items: CartItem[]; selectedTotalCents: number; message?: string };

export const api = {
  home: () => http.get<HomeData>("/home"),
  categories: () => http.get<Category[]>("/categories"),
  categoryProducts: (code: string) =>
    http.get<{ category: Category; products: Product[] }>(`/categories/${code}/products`),
  product: (code: string) => http.get<Product>(`/products/${code}`),
  search: (q: string) => http.get<Product[]>(`/search?q=${encodeURIComponent(q)}`),

  login: (username: string, password: string) =>
    http.post<{ token: string; user: UserInfo }>("/auth/login", { username, password }),
  logout: () => http.post("/auth/logout"),
  me: () => http.get<UserInfo>("/me"),

  cart: () => http.get<CartView>("/cart"),
  addCart: (body: { productCode: string; color?: string; capacity?: string; qty?: number }) =>
    http.post<CartView>("/cart", body),
  setQty: (itemId: string, qty: number) => http.patch<CartView>(`/cart/${itemId}`, { qty }),
  toggle: (itemId: string, selected: boolean) =>
    http.patch<CartView>(`/cart/${itemId}/select`, { selected }),
  removeItem: (itemId: string) => http.del<CartView>(`/cart/${itemId}`),

  createCheckout: (body: {
    source: "CART" | "BUY_NOW"; productCode?: string; color?: string; capacity?: string; qty?: number;
  }) => http.post<Checkout>("/checkout", body),
  getCheckout: (id: string) => http.get<Checkout>(`/checkout/${id}`),
  pay: (id: string) => http.post<{ order: Order; membership: Membership }>(`/checkout/${id}/pay`),

  orders: () => http.get<Order[]>("/orders"),
  order: (orderNo: string) => http.get<Order>(`/orders/${orderNo}`),
  membership: () => http.get<Membership>("/membership"),

  reset: () => http.post("/demo/reset"),

  // Admin
  adminLogin: (username: string, password: string) =>
    http.post<{ token: string }>("/admin/login", { username, password }),
  adminProducts: () => http.get<Product[]>("/admin/products"),
  adminShelf: (code: string, published: boolean) =>
    http.patch<Product>(`/admin/products/${code}/shelf`, { published }),
  adminStock: (code: string, stock: "IN_STOCK" | "SOLD_OUT") =>
    http.patch<Product>(`/admin/products/${code}/stock`, { stock }),
  adminOrders: () => http.get<Order[]>("/admin/orders"),
  adminBanners: () => http.get<Banner[]>("/admin/banners"),
  adminBannerShelf: (code: string, published: boolean) =>
    http.patch<Banner>(`/admin/banners/${code}/shelf`, { published }),
  adminServices: () => http.get<Product[]>("/admin/services"),
  adminServiceShelf: (code: string, published: boolean) =>
    http.patch<Product>(`/admin/services/${code}/shelf`, { published }),
  adminSession: () => http.get<AdminSession>("/admin/session"),
  // change 0010 · CRUD
  adminCreateProduct: (body: Record<string, unknown>) => http.post<Product>("/admin/products", body),
  adminUpdateProduct: (code: string, body: Record<string, unknown>) => http.patch<Product>(`/admin/products/${code}`, body),
  adminCreateBanner: (body: Record<string, unknown>) => http.post<Banner>("/admin/banners", body),
  adminUpdateBanner: (code: string, body: Record<string, unknown>) => http.patch<Banner>(`/admin/banners/${code}`, body),
  adminUpdateService: (code: string, body: Record<string, unknown>) => http.patch<Product>(`/admin/services/${code}`, body),
};

export interface AdminSession {
  cartCount: number;
  cartSelected: number;
  checkoutCount: number;
  orderCount: number;
  membership: string;
  seq: { seqP: number; seqM: number };
}
