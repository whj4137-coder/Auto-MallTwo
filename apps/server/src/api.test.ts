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
