import type { Product } from "@apex/shared";
import { Glyph, typeVisual } from "./icons";

// 商品视觉：有 image 用插画填充容器（object-fit cover），否则回退类型图标。
export function ProductMedia({ product }: { product: Pick<Product, "image" | "type" | "category"> }) {
  if (product.image) {
    return <img src={product.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />;
  }
  return <Glyph name={typeVisual(product.type, product.category).icon} />;
}
