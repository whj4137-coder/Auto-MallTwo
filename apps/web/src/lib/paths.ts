import type { Product } from "@apex/shared";

// 商品 → 详情路由：会员→/membership，展示服务→/service，实物→/product。
export function productPath(p: Pick<Product, "productCode" | "type">): string {
  if (p.type === "MEMBERSHIP") return `/membership/${p.productCode}`;
  if (p.type === "DISPLAY_SERVICE") return `/service/${p.productCode}`;
  return `/product/${p.productCode}`;
}
