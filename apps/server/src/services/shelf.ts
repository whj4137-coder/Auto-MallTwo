import type { Product } from "@apex/shared";

// ShelfFilter — published 可见性 + 排序。前台只读接口只返回 published=true。
export function visibleProducts(products: Product[]): Product[] {
  return products
    .filter((p) => p.published)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function isVisible(p: Product | undefined): p is Product {
  return !!p && p.published;
}
