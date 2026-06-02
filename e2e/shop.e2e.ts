import { test, expect, type Page } from "@playwright/test";

// 注：登录/驾驶/网络为内存态，整页 reload(=应用重启) 会复位为 GUEST/PARKED/ONLINE（符合 spec）。
// 因此用例登录后一律用「点击导航」(SPA) 而非 page.goto，模拟真实用户操作。

async function reset(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "重置数据" }).click();
  await expect(page.getByText(/STATUS GUEST/)).toBeVisible();
}
async function login(page: Page) {
  await page.locator(".segs .seg").nth(2).getByText("已登录", { exact: true }).click();
  await expect(page.getByText(/STATUS USER/)).toBeVisible();
}
const featured = (page: Page, name: string) => page.locator(".bigcard", { hasText: name });

test("A-01 实物购物闭环：加购 → 结算 → 支付 → 支付成功 ORDER-P", async ({ page }) => {
  await reset(page);
  await login(page);
  await featured(page, "磁吸手机支架").click();
  await expect(page).toHaveURL(/\/product\//);
  await page.getByRole("button", { name: "加入购物车" }).click();
  await expect(page.getByText("已加入购物车")).toBeVisible();

  await page.locator('nav.nav a[href="/cart"]').click();
  await page.getByRole("button", { name: "前往结算" }).click();
  await expect(page).toHaveURL(/\/confirm\//);
  await page.getByRole("button", { name: "去支付" }).click();
  await expect(page).toHaveURL(/\/pay\//);
  await page.getByRole("button", { name: "模拟扫码成功" }).click();
  await expect(page.getByText("支付成功")).toBeVisible();
  await expect(page.getByText(/ORDER-P-\d{3}/)).toBeVisible();
});

test("B-01 会员开通：立即开通 → 支付 → 权益已开通 ORDER-M", async ({ page }) => {
  await reset(page);
  await login(page);
  await featured(page, "悦行会员月卡").click();
  await expect(page).toHaveURL(/\/membership\//);
  await page.getByRole("button", { name: "立即开通" }).click();
  await expect(page.getByText("确认开通")).toBeVisible();
  await page.getByRole("button", { name: "去支付" }).click();
  await page.getByRole("button", { name: "模拟扫码成功" }).click();
  await expect(page.getByText("权益已开通")).toBeVisible();
  await expect(page.getByText(/ORDER-M-\d{3}/)).toBeVisible();
});

test("AUTH-01 未登录加购 → 弹登录弹窗", async ({ page }) => {
  await reset(page); // GUEST
  await featured(page, "磁吸手机支架").click();
  await page.getByRole("button", { name: "加入购物车" }).click();
  await expect(page.locator(".dialog")).toBeVisible();
  await expect(page.getByText("Mock 登录")).toBeVisible();
});

test("D-01 行车加购 → 拦截 toast，不入车", async ({ page }) => {
  await reset(page);
  await login(page);
  await page.locator(".segs .seg").nth(0).getByText("行车", { exact: true }).click();
  await featured(page, "磁吸手机支架").click();
  await page.getByRole("button", { name: "加入购物车" }).click();
  await expect(page.getByText("行车中仅支持浏览，请在驻车后继续操作")).toBeVisible();
  await expect(page.getByText(/CART 0/)).toBeVisible();
});

test("A-02 立即购买 → 进确认页，购物车不变", async ({ page }) => {
  await reset(page);
  await login(page);
  await featured(page, "磁吸手机支架").click();
  await page.getByRole("button", { name: "立即购买" }).click();
  await expect(page).toHaveURL(/\/confirm\//);
  await expect(page.getByText(/CART 0/)).toBeVisible(); // BUY_NOW 不触购物车
});

test("C-01 展示服务不可购买（无加购/购买入口）", async ({ page }) => {
  await reset(page);
  await page.locator(".scard", { hasText: "城市快充服务" }).click();
  await expect(page).toHaveURL(/\/service\//);
  await expect(page.getByRole("button", { name: "暂未开放" })).toBeVisible();
  await expect(page.getByRole("button", { name: "加入购物车" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "立即购买" })).toHaveCount(0);
});

test("D-02 断网加购 → 拦截 toast，不入车", async ({ page }) => {
  await reset(page);
  await login(page);
  await page.locator(".segs .seg").nth(1).getByText("断网", { exact: true }).click();
  await featured(page, "磁吸手机支架").click();
  await page.getByRole("button", { name: "加入购物车" }).click();
  await expect(page.getByText("当前网络不可用，请检查网络后重试")).toBeVisible();
  await expect(page.getByText(/CART 0/)).toBeVisible();
});

test("SEARCH-01 搜索命中 + 空结果", async ({ page }) => {
  await reset(page);
  await page.locator(".search.r").click(); // 首页搜索框 → 搜索页
  await expect(page).toHaveURL(/\/search/);
  await page.locator(".search input").fill("支架");
  await expect(page.locator(".bigcard", { hasText: "磁吸手机支架" })).toBeVisible();
  await page.locator(".search input").fill("zzzz");
  await expect(page.getByText("未查询到你想要的结果")).toBeVisible();
});
