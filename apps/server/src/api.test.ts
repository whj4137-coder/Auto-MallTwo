import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "./app.js";
import { store } from "./store/InMemoryStore.js";
import { ERR, COPY } from "@apex/shared";

const app = createApp();

async function login(): Promise<string> {
  const res = await request(app).post("/api/auth/login").send({ username: "admin", password: "123456" });
  return res.body.data.token as string;
}
const auth = (t: string) => ({ Authorization: `Bearer ${t}` });

beforeEach(() => store.resetAll());

// L2 · 后端 API 契约 + 门禁 + 闭环（Supertest）
describe("envelope & home", () => {
  it("health 统一信封", async () => {
    const r = await request(app).get("/api/health");
    expect(r.body).toMatchObject({ code: 0, data: { up: true } });
  });
  it("home：精选 3 + 5 货架，仅 published", async () => {
    const r = await request(app).get("/api/home");
    expect(r.body.code).toBe(ERR.OK);
    expect(r.body.data.featured.map((p: any) => p.productCode)).toEqual(["phy_car_001", "phy_ele_001", "mem_001"]);
    expect(r.body.data.shelves).toHaveLength(5);
  });
});

describe("门禁", () => {
  it("未登录写入 → 1001", async () => {
    const r = await request(app).post("/api/cart").send({ productCode: "phy_car_001" });
    expect(r.body.code).toBe(ERR.UNAUTHORIZED);
  });
  it("行车写入 → 2001 + COPY-001", async () => {
    const t = await login();
    const r = await request(app).post("/api/cart").set(auth(t)).set("x-demo-drive", "DRIVING").send({ productCode: "phy_car_001" });
    expect(r.body.code).toBe(ERR.DRIVING_BLOCKED);
    expect(r.body.message).toBe(COPY.C001_DRIVING);
  });
  it("断网写入 → 2002", async () => {
    const t = await login();
    const r = await request(app).post("/api/cart").set(auth(t)).set("x-demo-net", "OFFLINE").send({ productCode: "phy_car_001" });
    expect(r.body.code).toBe(ERR.OFFLINE_BLOCKED);
  });
  it("展示服务加购 → 2003（C-01）", async () => {
    const t = await login();
    const r = await request(app).post("/api/cart").set(auth(t)).send({ productCode: "svc_charge_001" });
    expect(r.body.code).toBe(ERR.SCOPE_BLOCKED);
  });
});

describe("A-01 实物购物闭环", () => {
  it("加购合并 → checkout → 支付 → ORDER-P-001 + 收货/配送字段", async () => {
    const t = await login();
    await request(app).post("/api/cart").set(auth(t)).send({ productCode: "phy_car_001", qty: 1 });
    const add = await request(app).post("/api/cart").set(auth(t)).send({ productCode: "phy_car_001", qty: 1 });
    expect(add.body.data.items).toHaveLength(1); // 同 SKU 合并
    expect(add.body.data.selectedTotalCents).toBe(25800); // 129×2

    const co = await request(app).post("/api/checkout").set(auth(t)).send({ source: "CART" });
    expect(co.body.data.totalCents).toBe(25800);
    expect(co.body.data.receiver.name).toBe(store.user.receiver.name);
    expect(co.body.data.deliveryNote).toBeTruthy();

    const pay = await request(app).post(`/api/checkout/${co.body.data.checkoutId}/pay`).set(auth(t));
    expect(pay.body.data.order.orderNo).toBe("ORDER-P-001");
    expect(pay.body.data.order.status).toBe("PAID");

    const orders = await request(app).get("/api/orders").set(auth(t));
    expect(orders.body.data).toHaveLength(1);
  });

  it("数量上限 5", async () => {
    const t = await login();
    const r = await request(app).post("/api/cart").set(auth(t)).send({ productCode: "phy_car_001", qty: 99 });
    expect(r.body.data.items[0].qty).toBe(5);
  });
});

describe("B-01 会员开通（互斥幂等）", () => {
  it("开通 → ORDER-M-001 + ACTIVE；再支付不产生新单", async () => {
    const t = await login();
    const co = await request(app).post("/api/checkout").set(auth(t)).send({ source: "BUY_NOW", productCode: "mem_001" });
    expect(co.body.data.type).toBe("MEMBERSHIP");
    const pay = await request(app).post(`/api/checkout/${co.body.data.checkoutId}/pay`).set(auth(t));
    expect(pay.body.data.order.orderNo).toBe("ORDER-M-001");
    expect(pay.body.data.membership.status).toBe("ACTIVE");

    // 再开通年卡 → 已 ACTIVE，幂等，不新增订单
    const co2 = await request(app).post("/api/checkout").set(auth(t)).send({ source: "BUY_NOW", productCode: "mem_002" });
    await request(app).post(`/api/checkout/${co2.body.data.checkoutId}/pay`).set(auth(t));
    const orders = await request(app).get("/api/orders").set(auth(t));
    expect(orders.body.data.filter((o: any) => o.type === "MEMBERSHIP")).toHaveLength(1);
  });
});

describe("上下架 / 售罄结算拦截（4009）", () => {
  it("购物车含下架品 → 结算 4009 DELISTED", async () => {
    const t = await login();
    await request(app).post("/api/cart").set(auth(t)).send({ productCode: "phy_car_001" });
    await request(app).patch("/api/admin/products/phy_car_001/shelf").set(auth(t)).send({ published: false });
    const co = await request(app).post("/api/checkout").set(auth(t)).send({ source: "CART" });
    expect(co.body.code).toBe(ERR.NOT_CHECKOUTABLE);
    expect(co.body.data.reason).toBe("DELISTED");
  });
  it("售罄品加购 → 4009 SOLD_OUT", async () => {
    const t = await login();
    await request(app).patch("/api/admin/products/phy_car_001/stock").set(auth(t)).send({ stock: "SOLD_OUT" });
    const r = await request(app).post("/api/cart").set(auth(t)).send({ productCode: "phy_car_001" });
    expect(r.body.code).toBe(ERR.NOT_CHECKOUTABLE);
    expect(r.body.data.reason).toBe("SOLD_OUT");
  });
});

describe("Admin CRUD（change 0010）", () => {
  it("新增商品 → 出现在列表，校验失败返 4000", async () => {
    const t = await login();
    const bad = await request(app).post("/api/admin/products").set(auth(t)).send({ name: "", category: "cat_car_goods", priceCents: 100 });
    expect(bad.body.code).toBe(ERR.VALIDATION);
    const badCat = await request(app).post("/api/admin/products").set(auth(t)).send({ name: "X", category: "nope", priceCents: 100 });
    expect(badCat.body.code).toBe(ERR.VALIDATION);
    const noPrice = await request(app).post("/api/admin/products").set(auth(t)).send({ name: "X", category: "cat_car_goods" });
    expect(noPrice.body.code).toBe(ERR.VALIDATION);

    const ok = await request(app).post("/api/admin/products").set(auth(t)).send({ name: "测试脚垫", category: "cat_car_goods", priceCents: 8800 });
    expect(ok.body.code).toBe(ERR.OK);
    const list = await request(app).get("/api/admin/products").set(auth(t));
    expect(list.body.data.some((p: any) => p.name === "测试脚垫")).toBe(true);
  });

  it("改商品价格 → 前台只读接口生效", async () => {
    const t = await login();
    const r = await request(app).patch("/api/admin/products/phy_car_001").set(auth(t)).send({ priceCents: 13900 });
    expect(r.body.data.priceCents).toBe(13900);
    const detail = await request(app).get("/api/products/phy_car_001");
    expect(detail.body.data.priceCents).toBe(13900);
  });

  it("改价非正整数 → 4000", async () => {
    const t = await login();
    const r = await request(app).patch("/api/admin/products/phy_car_001").set(auth(t)).send({ priceCents: -1 });
    expect(r.body.code).toBe(ERR.VALIDATION);
  });

  it("新增 Banner（目标必须存在）", async () => {
    const t = await login();
    const bad = await request(app).post("/api/admin/banners").set(auth(t)).send({ title: "X", targetProductCode: "nope" });
    expect(bad.body.code).toBe(ERR.VALIDATION);
    const ok = await request(app).post("/api/admin/banners").set(auth(t)).send({ title: "新活动", targetProductCode: "phy_ele_001" });
    expect(ok.body.code).toBe(ERR.OK);
  });

  it("改会员服务价格/有效期", async () => {
    const t = await login();
    const r = await request(app).patch("/api/admin/services/mem_001").set(auth(t)).send({ priceCents: 4900, validDays: 31 });
    expect(r.body.data.priceCents).toBe(4900);
    expect(r.body.data.validDays).toBe(31);
  });

  it("Admin 下架 → 前台只读接口实时不返回（home/category/detail）", async () => {
    const t = await login();
    await request(app).patch("/api/admin/products/phy_car_001/shelf").set(auth(t)).send({ published: false });
    const home = await request(app).get("/api/home");
    expect(home.body.data.banners.some((b: any) => b.targetProductCode === "phy_car_001")).toBe(false);
    expect(home.body.data.featured.some((p: any) => p.productCode === "phy_car_001")).toBe(false);
    const shelf = home.body.data.shelves.find((s: any) => s.category.categoryCode === "cat_car_goods");
    expect(shelf.products.some((p: any) => p.productCode === "phy_car_001")).toBe(false);
    const cat = await request(app).get("/api/categories/cat_car_goods/products");
    expect(cat.body.data.products.some((p: any) => p.productCode === "phy_car_001")).toBe(false);
    const detail = await request(app).get("/api/products/phy_car_001");
    expect(detail.body.code).toBe(ERR.NOT_FOUND); // 下架详情 4004
  });

  it("Admin 改价 → 首页/详情实时同步", async () => {
    const t = await login();
    await request(app).patch("/api/admin/products/phy_car_001").set(auth(t)).send({ priceCents: 13900 });
    const detail = await request(app).get("/api/products/phy_car_001");
    expect(detail.body.data.priceCents).toBe(13900);
  });
});

describe("门禁矩阵补充（REQ-024：写入端点统一受 auth+gateWrite）", () => {
  it("checkout(CART)：GUEST→1001、DRIVING→2001", async () => {
    const g = await request(app).post("/api/checkout").send({ source: "CART" });
    expect(g.body.code).toBe(ERR.UNAUTHORIZED);
    const t = await login();
    await request(app).post("/api/cart").set(auth(t)).send({ productCode: "phy_car_001" });
    const d = await request(app).post("/api/checkout").set(auth(t)).set("x-demo-drive", "DRIVING").send({ source: "CART" });
    expect(d.body.code).toBe(ERR.DRIVING_BLOCKED);
  });
  it("pay：OFFLINE→2002", async () => {
    const t = await login();
    await request(app).post("/api/cart").set(auth(t)).send({ productCode: "phy_car_001" });
    const co = await request(app).post("/api/checkout").set(auth(t)).send({ source: "CART" });
    const p = await request(app).post(`/api/checkout/${co.body.data.checkoutId}/pay`).set(auth(t)).set("x-demo-net", "OFFLINE");
    expect(p.body.code).toBe(ERR.OFFLINE_BLOCKED);
  });
  it("会员开通 checkout：GUEST→1001", async () => {
    const g = await request(app).post("/api/checkout").send({ source: "BUY_NOW", productCode: "mem_001" });
    expect(g.body.code).toBe(ERR.UNAUTHORIZED);
  });
  it("购物车改量：DRIVING→2001", async () => {
    const t = await login();
    const add = await request(app).post("/api/cart").set(auth(t)).send({ productCode: "phy_car_001" });
    const id = add.body.data.items[0].itemId;
    const q = await request(app).patch(`/api/cart/${id}`).set(auth(t)).set("x-demo-drive", "DRIVING").send({ qty: 3 });
    expect(q.body.code).toBe(ERR.DRIVING_BLOCKED);
  });
  // 优先级 DRIVING > OFFLINE > GUEST（PRD §8）：同时命中只返最高，行车/断网先于 GUEST
  it("优先级：未登录 + 行车 → 2001（非 1001）", async () => {
    const r = await request(app).post("/api/cart").set("x-demo-drive", "DRIVING").send({ productCode: "phy_car_001" });
    expect(r.body.code).toBe(ERR.DRIVING_BLOCKED);
  });
  it("优先级：未登录 + 断网 → 2002（非 1001）", async () => {
    const r = await request(app).post("/api/cart").set("x-demo-net", "OFFLINE").send({ productCode: "phy_car_001" });
    expect(r.body.code).toBe(ERR.OFFLINE_BLOCKED);
  });
});

describe("重复支付拦截（EDGE-013 / §12.1）", () => {
  it("实物 checkout 二次支付 → 4009 ALREADY_PAID，不生成第二单，seq 不递增", async () => {
    const t = await login();
    await request(app).post("/api/cart").set(auth(t)).send({ productCode: "phy_car_001" });
    const co = await request(app).post("/api/checkout").set(auth(t)).send({ source: "CART" });
    const pay1 = await request(app).post(`/api/checkout/${co.body.data.checkoutId}/pay`).set(auth(t));
    expect(pay1.body.data.order.orderNo).toBe("ORDER-P-001");
    const pay2 = await request(app).post(`/api/checkout/${co.body.data.checkoutId}/pay`).set(auth(t));
    expect(pay2.body.code).toBe(ERR.NOT_CHECKOUTABLE);
    expect(pay2.body.data.reason).toBe("ALREADY_PAID");
    const orders = await request(app).get("/api/orders").set(auth(t));
    expect(orders.body.data).toHaveLength(1);
    expect(store.seq.snapshot().seqP).toBe(1);
  });
});

describe("搜索（REQ-003 / §15.10.2）", () => {
  it("空 q → 4000", async () => {
    const r = await request(app).get("/api/search?q=");
    expect(r.body.code).toBe(ERR.VALIDATION);
  });
  it("命中实物（substring）", async () => {
    const r = await request(app).get("/api/search?q=" + encodeURIComponent("支架"));
    expect(r.body.code).toBe(ERR.OK);
    expect(r.body.data.some((p: any) => p.productCode === "phy_car_001")).toBe(true);
  });
  it("排除展示服务", async () => {
    const r = await request(app).get("/api/search?q=" + encodeURIComponent("充电"));
    expect(r.body.code).toBe(ERR.OK);
    expect(r.body.data.every((p: any) => p.type !== "DISPLAY_SERVICE")).toBe(true);
  });
});

describe("Demo 重置", () => {
  it("清会话 + seq 归零", async () => {
    const t = await login();
    await request(app).post("/api/cart").set(auth(t)).send({ productCode: "phy_car_001" });
    const co = await request(app).post("/api/checkout").set(auth(t)).send({ source: "CART" });
    await request(app).post(`/api/checkout/${co.body.data.checkoutId}/pay`).set(auth(t));
    await request(app).post("/api/demo/reset");
    expect(store.orders).toHaveLength(0);
    expect(store.seq.snapshot()).toEqual({ seqP: 0, seqM: 0 });
  });
});

// ===== change 0013 · 补充空白端点 / 边界行为 =====

describe("鉴权（登录/登出/我的）", () => {
  it("错误密码 → 1002 + COPY-003", async () => {
    const r = await request(app).post("/api/auth/login").send({ username: "admin", password: "wrong" });
    expect(r.body.code).toBe(ERR.BAD_CREDENTIALS);
    expect(r.body.message).toBe(COPY.C003_LOGIN_FAIL);
  });
  it("登出后 token 失效 → 写入 1001", async () => {
    const t = await login();
    const out = await request(app).post("/api/auth/logout").set(auth(t));
    expect(out.body.code).toBe(ERR.OK);
    const w = await request(app).post("/api/cart").set(auth(t)).send({ productCode: "phy_car_001" });
    expect(w.body.code).toBe(ERR.UNAUTHORIZED);
  });
  it("GET /me 返回演示用户（含收货人/车辆）", async () => {
    const r = await request(app).get("/api/me");
    expect(r.body.code).toBe(ERR.OK);
    expect(r.body.data.username).toBe("admin");
    expect(r.body.data.receiver).toBeTruthy();
    expect(r.body.data.vehicle).toBeTruthy();
  });
});

describe("订单详情 / 会员状态（只读）", () => {
  it("未登录取订单 → 1001", async () => {
    const r = await request(app).get("/api/orders");
    expect(r.body.code).toBe(ERR.UNAUTHORIZED);
  });
  it("订单详情命中 + 不存在 4004", async () => {
    const t = await login();
    await request(app).post("/api/cart").set(auth(t)).send({ productCode: "phy_car_001" });
    const co = await request(app).post("/api/checkout").set(auth(t)).send({ source: "CART" });
    await request(app).post(`/api/checkout/${co.body.data.checkoutId}/pay`).set(auth(t));
    const hit = await request(app).get("/api/orders/ORDER-P-001").set(auth(t));
    expect(hit.body.code).toBe(ERR.OK);
    expect(hit.body.data.orderNo).toBe("ORDER-P-001");
    const miss = await request(app).get("/api/orders/ORDER-P-999").set(auth(t));
    expect(miss.body.code).toBe(ERR.NOT_FOUND);
  });
  it("会员状态机 INACTIVE → ACTIVE", async () => {
    const t = await login();
    const before = await request(app).get("/api/membership").set(auth(t));
    expect(before.body.data.status).toBe("INACTIVE");
    const co = await request(app).post("/api/checkout").set(auth(t)).send({ source: "BUY_NOW", productCode: "mem_001" });
    await request(app).post(`/api/checkout/${co.body.data.checkoutId}/pay`).set(auth(t));
    const after = await request(app).get("/api/membership").set(auth(t));
    expect(after.body.data.status).toBe("ACTIVE");
    expect(after.body.data.orderNo).toBe("ORDER-M-001");
  });
});

describe("目录 4004 / 类目列表", () => {
  it("商品详情不存在 → 4004", async () => {
    const r = await request(app).get("/api/products/nope_999");
    expect(r.body.code).toBe(ERR.NOT_FOUND);
  });
  it("类目列表按 sortOrder 升序", async () => {
    const r = await request(app).get("/api/categories");
    expect(r.body.code).toBe(ERR.OK);
    const orders = r.body.data.map((c: any) => c.sortOrder);
    expect(orders).toEqual([...orders].sort((a: number, b: number) => a - b));
  });
  it("类目不存在 → 4004", async () => {
    const r = await request(app).get("/api/categories/nope/products");
    expect(r.body.code).toBe(ERR.NOT_FOUND);
  });
});

describe("购物车 删除 / 勾选 / 改量边界", () => {
  it("删除项 → 行消失", async () => {
    const t = await login();
    const add = await request(app).post("/api/cart").set(auth(t)).send({ productCode: "phy_car_001" });
    const id = add.body.data.items[0].itemId;
    const del = await request(app).delete(`/api/cart/${id}`).set(auth(t));
    expect(del.body.data.items).toHaveLength(0);
  });
  it("取消勾选 → selectedTotalCents 归零", async () => {
    const t = await login();
    const add = await request(app).post("/api/cart").set(auth(t)).send({ productCode: "phy_car_001" });
    const id = add.body.data.items[0].itemId;
    expect(add.body.data.selectedTotalCents).toBe(12900);
    const sel = await request(app).patch(`/api/cart/${id}/select`).set(auth(t)).send({ selected: false });
    expect(sel.body.data.selectedTotalCents).toBe(0);
  });
  it("改量 0 → 钳到 1；改量 99 → 钳到 5", async () => {
    const t = await login();
    const add = await request(app).post("/api/cart").set(auth(t)).send({ productCode: "phy_car_001" });
    const id = add.body.data.items[0].itemId;
    const lo = await request(app).patch(`/api/cart/${id}`).set(auth(t)).send({ qty: 0 });
    expect(lo.body.data.items[0].qty).toBe(1);
    const hi = await request(app).patch(`/api/cart/${id}`).set(auth(t)).send({ qty: 99 });
    expect(hi.body.data.items[0].qty).toBe(5);
  });
  it("改/删不存在项 → 4004", async () => {
    const t = await login();
    const q = await request(app).patch("/api/cart/ghost").set(auth(t)).send({ qty: 2 });
    expect(q.body.code).toBe(ERR.NOT_FOUND);
    const s = await request(app).patch("/api/cart/ghost/select").set(auth(t)).send({ selected: true });
    expect(s.body.code).toBe(ERR.NOT_FOUND);
  });
});

describe("A-02 立即购买实物（购物车不变量）", () => {
  it("BUY_NOW 实物落单，购物车行数/数量/勾选不变", async () => {
    const t = await login();
    // 基线：购物车放另一实物，勾选态
    const base = await request(app).post("/api/cart").set(auth(t)).send({ productCode: "phy_ele_001", qty: 2 });
    const baseItems = base.body.data.items.length;
    const baseQty = base.body.data.items[0].qty;
    const baseSelected = base.body.data.items[0].selected;

    const co = await request(app).post("/api/checkout").set(auth(t)).send({ source: "BUY_NOW", productCode: "phy_car_001" });
    expect(co.body.data.type).toBe("PHYSICAL");
    const pay = await request(app).post(`/api/checkout/${co.body.data.checkoutId}/pay`).set(auth(t));
    expect(pay.body.data.order.orderNo).toBe("ORDER-P-001");

    const cart = await request(app).get("/api/cart").set(auth(t));
    expect(cart.body.data.items).toHaveLength(baseItems);
    expect(cart.body.data.items[0].qty).toBe(baseQty);
    expect(cart.body.data.items[0].selected).toBe(baseSelected);
  });
});

describe("Admin 鉴权 / 会话快照 / 服务上下架", () => {
  it("GUEST 访问 admin → 1001", async () => {
    const r = await request(app).get("/api/admin/products");
    expect(r.body.code).toBe(ERR.UNAUTHORIZED);
  });
  it("admin/login 正确发 token / 错误 1002", async () => {
    const bad = await request(app).post("/api/admin/login").send({ username: "admin", password: "x" });
    expect(bad.body.code).toBe(ERR.BAD_CREDENTIALS);
    const ok = await request(app).post("/api/admin/login").send({ username: "admin", password: "123456" });
    expect(ok.body.data.token).toBeTruthy();
  });
  it("GET /admin/session 反映运行快照", async () => {
    const t = await login();
    await request(app).post("/api/cart").set(auth(t)).send({ productCode: "phy_car_001", qty: 3 });
    const r = await request(app).get("/api/admin/session").set(auth(t));
    expect(r.body.data.cartCount).toBe(3);
    expect(r.body.data.cartSelected).toBe(1);
    expect(r.body.data.orderCount).toBe(0);
    expect(r.body.data.seq).toEqual({ seqP: 0, seqM: 0 });
  });
  it("Banner 下架 → 首页不再返回", async () => {
    const t = await login();
    const list = await request(app).get("/api/admin/banners").set(auth(t));
    const code = list.body.data[0].bannerCode;
    await request(app).patch(`/api/admin/banners/${code}/shelf`).set(auth(t)).send({ published: false });
    const home = await request(app).get("/api/home");
    expect(home.body.data.banners.some((b: any) => b.bannerCode === code)).toBe(false);
  });
  it("会员服务下架 → 首页货架不可见；非服务码 4004", async () => {
    const t = await login();
    await request(app).patch("/api/admin/services/mem_001/shelf").set(auth(t)).send({ published: false });
    const home = await request(app).get("/api/home");
    expect(home.body.data.featured.some((p: any) => p.productCode === "mem_001")).toBe(false);
    const bad = await request(app).patch("/api/admin/services/phy_car_001/shelf").set(auth(t)).send({ published: false });
    expect(bad.body.code).toBe(ERR.NOT_FOUND); // 实物码不在服务集合
  });
});

// ===== change 0014 · EDGE-001..025 逐条边界（§15.12，后端可断言部分）=====
// 颜色/价格不硬编码 §10 锁定值：颜色经详情接口动态取、改价用非种子数值。

describe("EDGE 边界（§15.12）", () => {
  it("EDGE-001 同 SKU 增量加购合并封顶 5（4+3→5）", async () => {
    const t = await login();
    await request(app).post("/api/cart").set(auth(t)).send({ productCode: "phy_car_001", qty: 4 });
    const r = await request(app).post("/api/cart").set(auth(t)).send({ productCode: "phy_car_001", qty: 3 });
    expect(r.body.data.items).toHaveLength(1);
    expect(r.body.data.items[0].qty).toBe(5);
  });

  it("EDGE-002 不同 SKU（颜色）不合并 → 两行", async () => {
    const t = await login();
    const detail = await request(app).get("/api/products/phy_car_001");
    const [c1, c2] = detail.body.data.colors;
    await request(app).post("/api/cart").set(auth(t)).send({ productCode: "phy_car_001", color: c1 });
    const r = await request(app).post("/api/cart").set(auth(t)).send({ productCode: "phy_car_001", color: c2 });
    expect(r.body.data.items).toHaveLength(2);
  });

  it("EDGE-004 购物车已有 → Admin 改售罄 → 结算 4009 SOLD_OUT", async () => {
    const t = await login();
    await request(app).post("/api/cart").set(auth(t)).send({ productCode: "phy_car_001" });
    await request(app).patch("/api/admin/products/phy_car_001/stock").set(auth(t)).send({ stock: "SOLD_OUT" });
    const co = await request(app).post("/api/checkout").set(auth(t)).send({ source: "CART" });
    expect(co.body.code).toBe(ERR.NOT_CHECKOUTABLE);
    expect(co.body.data.reason).toBe("SOLD_OUT");
  });

  // EDGE-005（§15.12，change 0015 对齐）：购物车内商品被 Admin 改价后，
  // CART 结算按新价；已落单的历史订单按落单快照不变。
  it("EDGE-005 购物车内改价 → CART 结算按新价", async () => {
    const t = await login();
    await request(app).post("/api/cart").set(auth(t)).send({ productCode: "phy_ele_001" });
    await request(app).patch("/api/admin/products/phy_ele_001").set(auth(t)).send({ priceCents: 70000 });
    const co = await request(app).post("/api/checkout").set(auth(t)).send({ source: "CART" });
    expect(co.body.data.lines[0].unitPriceCents).toBe(70000);
    expect(co.body.data.totalCents).toBe(70000 * co.body.data.lines[0].qty);
  });

  it("EDGE-005 落单后改价 → 历史订单金额快照不变", async () => {
    const t = await login();
    await request(app).post("/api/cart").set(auth(t)).send({ productCode: "phy_ele_001" });
    const co = await request(app).post("/api/checkout").set(auth(t)).send({ source: "CART" });
    const pay = await request(app).post(`/api/checkout/${co.body.data.checkoutId}/pay`).set(auth(t));
    const orderNo = pay.body.data.order.orderNo;
    const paidTotal = pay.body.data.order.totalCents;
    await request(app).patch("/api/admin/products/phy_ele_001").set(auth(t)).send({ priceCents: 80000 });
    const detail = await request(app).get(`/api/orders/${orderNo}`).set(auth(t));
    expect(detail.body.data.totalCents).toBe(paidTotal);
  });

  it("EDGE-012 checkout 被 Demo reset 清掉 → 旧 checkout 失效", async () => {
    const t = await login();
    await request(app).post("/api/cart").set(auth(t)).send({ productCode: "phy_car_001" });
    const co = await request(app).post("/api/checkout").set(auth(t)).send({ source: "CART" });
    await request(app).post("/api/demo/reset"); // resetSession 同时清 tokens，需重新登录
    const t2 = await login();
    const old = await request(app).get(`/api/checkout/${co.body.data.checkoutId}`).set(auth(t2));
    expect(old.body.code).toBe(ERR.NOT_FOUND);
  });

  it("EDGE-014 订单商品后续下架 → 订单详情快照不受影响", async () => {
    const t = await login();
    await request(app).post("/api/cart").set(auth(t)).send({ productCode: "phy_car_001" });
    const co = await request(app).post("/api/checkout").set(auth(t)).send({ source: "CART" });
    const pay = await request(app).post(`/api/checkout/${co.body.data.checkoutId}/pay`).set(auth(t));
    const orderNo = pay.body.data.order.orderNo;
    await request(app).patch("/api/admin/products/phy_car_001/shelf").set(auth(t)).send({ published: false });
    const detail = await request(app).get(`/api/orders/${orderNo}`).set(auth(t));
    expect(detail.body.code).toBe(ERR.OK);
    expect(detail.body.data.lines.some((l: any) => l.productCode === "phy_car_001")).toBe(true);
  });

  it("EDGE-016 搜索下架商品 → 不返回", async () => {
    const t = await login();
    const before = await request(app).get("/api/search?q=" + encodeURIComponent("支架"));
    expect(before.body.data.some((p: any) => p.productCode === "phy_car_001")).toBe(true);
    await request(app).patch("/api/admin/products/phy_car_001/shelf").set(auth(t)).send({ published: false });
    const after = await request(app).get("/api/search?q=" + encodeURIComponent("支架"));
    expect(after.body.data.some((p: any) => p.productCode === "phy_car_001")).toBe(false);
  });

  it("EDGE-017 首页服务货架某项下架 → 该货架缺该项，不补其它", async () => {
    const t = await login();
    await request(app).patch("/api/admin/services/svc_life_001/shelf").set(auth(t)).send({ published: false });
    const home = await request(app).get("/api/home");
    const lifeShelf = home.body.data.shelves.find((s: any) => s.category.categoryCode === "cat_life");
    expect(lifeShelf.products.some((p: any) => p.productCode === "svc_life_001")).toBe(false);
  });

  it("EDGE-020 Demo reset 清订单/会员/购物车，但保留 Admin 商品改动", async () => {
    const t = await login();
    await request(app).patch("/api/admin/products/phy_car_001").set(auth(t)).send({ priceCents: 60000 });
    await request(app).post("/api/cart").set(auth(t)).send({ productCode: "phy_car_001" });
    const co = await request(app).post("/api/checkout").set(auth(t)).send({ source: "CART" });
    await request(app).post(`/api/checkout/${co.body.data.checkoutId}/pay`).set(auth(t));
    await request(app).post("/api/demo/reset");
    expect(store.orders).toHaveLength(0);
    expect(store.cart).toHaveLength(0);
    expect(store.membership.status).toBe("INACTIVE");
    const detail = await request(app).get("/api/products/phy_car_001");
    expect(detail.body.data.priceCents).toBe(60000); // 商品改动不被重置清除
  });

  it("EDGE-024 多重门禁 GUEST+DRIVING+OFFLINE → 只返 2001（DRIVING 最高）", async () => {
    const r = await request(app)
      .post("/api/cart")
      .set("x-demo-drive", "DRIVING")
      .set("x-demo-net", "OFFLINE")
      .send({ productCode: "phy_car_001" });
    expect(r.body.code).toBe(ERR.DRIVING_BLOCKED);
  });
});
