import { describe, it, expect } from "vitest";
import { yuan } from "./money";

// L1 · 金额显示（PRD §10.6）：分 → ¥整数无小数；服务展示占位。
describe("yuan", () => {
  it("分转整数元", () => {
    expect(yuan(12900)).toBe("¥129");
    expect(yuan(3900)).toBe("¥39");
    expect(yuan(0)).toBe("¥0");
  });
  it("null/undefined → 服务展示", () => {
    expect(yuan(null)).toBe("服务展示");
    expect(yuan(undefined)).toBe("服务展示");
  });
});
