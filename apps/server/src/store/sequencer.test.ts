import { describe, it, expect } from "vitest";
import { OrderSequencer } from "./sequencer.js";

// L1 · 订单号规则（PRD §10.5）：P/M 独立递增、三位零填充、重置归零。
describe("OrderSequencer", () => {
  it("ORDER-P/M 三位零填充、各自递增", () => {
    const s = new OrderSequencer();
    expect(s.nextP()).toBe("ORDER-P-001");
    expect(s.nextP()).toBe("ORDER-P-002");
    expect(s.nextM()).toBe("ORDER-M-001");
    expect(s.nextP()).toBe("ORDER-P-003");
    expect(s.snapshot()).toEqual({ seqP: 3, seqM: 1 });
  });

  it("reset 后回 001", () => {
    const s = new OrderSequencer();
    s.nextP(); s.nextM();
    s.reset();
    expect(s.snapshot()).toEqual({ seqP: 0, seqM: 0 });
    expect(s.nextP()).toBe("ORDER-P-001");
  });
});
