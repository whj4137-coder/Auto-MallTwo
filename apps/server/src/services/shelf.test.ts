import { describe, it, expect } from "vitest";
import { visibleProducts, isVisible } from "./shelf.js";
import type { Product } from "@apex/shared";

const p = (code: string, published: boolean, sortOrder: number): Product => ({
  productCode: code, category: "cat_car_goods", type: "PHYSICAL", name: code,
  priceCents: 100, colors: [], capacities: [], homeFeatured: false, published, sortOrder, stock: "IN_STOCK",
});

// L1 · ShelfFilter：只返回 published 且按 sortOrder 排序。
describe("shelf", () => {
  it("过滤下架 + 按 sortOrder 升序", () => {
    const list = [p("c", true, 3), p("a", true, 1), p("x", false, 2), p("b", true, 2)];
    expect(visibleProducts(list).map((x) => x.productCode)).toEqual(["a", "b", "c"]);
  });
  it("isVisible：未定义或下架为 false", () => {
    expect(isVisible(undefined)).toBe(false);
    expect(isVisible(p("a", false, 1))).toBe(false);
    expect(isVisible(p("a", true, 1))).toBe(true);
  });
});
