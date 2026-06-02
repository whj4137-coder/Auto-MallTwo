import type {
  ProductType,
  MembershipStatus,
  Stock,
  OrderStatus,
  CheckoutSource,
} from "./enums.js";

export interface Envelope<T = unknown> {
  code: number;
  message: string;
  data: T;
}

export interface Category {
  categoryCode: string;
  name: string;
  type: ProductType;
  sortOrder: number;
}

export interface Product {
  productCode: string;
  category: string;
  type: ProductType;
  name: string;
  priceCents: number | null; // DISPLAY_SERVICE 为 null（服务展示）
  colors: string[]; // 颜色 SKU
  capacities: string[]; // 容量 SKU
  homeFeatured: boolean;
  published: boolean;
  sortOrder: number;
  stock: Stock;
  // 仅会员
  validDays?: number;
  benefits?: string[];
  boundVehicle?: string;
  // 仅展示服务
  serviceDesc?: string;
  // 实物
  deliveryNote?: string;
}

export interface Banner {
  bannerCode: string;
  title: string;
  subtitle: string;
  targetProductCode: string;
  published: boolean;
  sortOrder: number;
}

export interface CartItem {
  itemId: string;
  productCode: string;
  name: string;
  type: ProductType;
  unitPriceCents: number;
  qty: number; // [1,5]
  color?: string;
  capacity?: string;
  selected: boolean;
  published: boolean;
  stock: Stock;
}

export interface CheckoutLine {
  productCode: string;
  name: string;
  color?: string;
  capacity?: string;
  unitPriceCents: number;
  qty: number;
  lineTotalCents: number;
}

export interface Checkout {
  checkoutId: string;
  source: CheckoutSource;
  type: ProductType;
  lines: CheckoutLine[];
  totalCents: number;
  paid: boolean;
  receiver?: { name: string; phone: string; address: string }; // 仅实物，后端注入
  deliveryNote?: string; // 仅实物，后端注入
}

export interface OrderLine extends CheckoutLine {}

export interface Order {
  orderNo: string; // ORDER-P-NNN / ORDER-M-NNN
  type: ProductType;
  status: OrderStatus;
  totalCents: number;
  lines: OrderLine[];
  createdAt: string;
  payMethod: string; // 模拟支付
  // 实物
  receiver?: { name: string; phone: string; address: string };
  // 会员
  validDays?: number;
  boundVehicle?: string;
}

export interface Membership {
  status: MembershipStatus;
  productCode?: string;
  orderNo?: string;
  validDays?: number;
  boundVehicle?: string;
}

export interface UserInfo {
  username: string;
  displayName: string;
  phoneMasked: string;
  plateMasked: string;
  vehicle: string;
  vehicleColor: string;
  receiver: { name: string; phone: string; address: string; label: string };
}

export interface HomeData {
  banners: Banner[];
  categories: (Category & { count: number })[];
  featured: Product[];
  shelves: { category: Category; products: Product[] }[];
}
