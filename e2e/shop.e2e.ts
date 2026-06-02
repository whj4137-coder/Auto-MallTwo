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
const layoutTolerance = 1;

async function expectNoPageOverflow(page: Page, route: string, allowVertical = false) {
  const overflow = await page.evaluate(() => ({
    x: document.documentElement.scrollWidth - window.innerWidth,
    y: document.documentElement.scrollHeight - window.innerHeight,
  }));
  expect(overflow.x, `横向溢出 @ ${route}`).toBeLessThanOrEqual(layoutTolerance);
  if (!allowVertical) {
    expect(overflow.y, `整页纵向溢出 @ ${route}`).toBeLessThanOrEqual(layoutTolerance);
  }
}

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

test("LAYOUT-01 1280×720 关键页面无意外整页滚动", async ({ page }) => {
  test.setTimeout(20000);
  const frontRoutes = [
    { route: "/", allowVertical: false },
    { route: "/category", allowVertical: false },
    { route: "/search", allowVertical: false },
    { route: "/product/phy_car_001", allowVertical: false },
    { route: "/membership/mem_001", allowVertical: false },
    { route: "/service/svc_charge_001", allowVertical: false },
    { route: "/cart", allowVertical: true },
    { route: "/orders", allowVertical: true },
    { route: "/mine", allowVertical: false },
  ];
  for (const { route, allowVertical } of frontRoutes) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await expectNoPageOverflow(page, route, allowVertical);
  }

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await login(page);
  await page.locator('nav.nav a[href="/cart"]').click();
  await expectNoPageOverflow(page, "/cart", true);

  await page.goto("/admin/login", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "登录" }).click();
  await expect(page).toHaveURL(/\/admin\/products/);
  const adminRoutes = ["/admin/products", "/admin/banners", "/admin/services", "/admin/orders", "/admin/session", "/admin/account"];
  for (const route of adminRoutes) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await expectNoPageOverflow(page, route, true);
  }
});

// ADMIN-01 三端联动：在后台 UI 真实点击下架/上架，前台 UI 实时反映（真实跨端 E2E，非仅 API 断言）。
// 自带还原（下架→验证→上架），避免污染其它用例的共享内存态。
test("ADMIN-01 后台下架/上架 → 前台实时反映（真实点击跨端联动）", async ({ page }) => {
  test.setTimeout(30000);
  const card = () => page.locator(".bigcard", { hasText: "磁吸手机支架" });

  async function adminLogin() {
    await page.goto("/admin/login", { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "登录" }).click();
    await expect(page).toHaveURL(/\/admin\/products/);
  }
  async function setShelf(targetOn: boolean) {
    const row = page.locator("tr", { hasText: "磁吸手机支架" });
    await expect(row).toBeVisible();
    const isOn = (await row.locator(".sw.on").count()) > 0;
    if (isOn !== targetOn) await row.locator(".sw").click();
    await expect(row.locator(".sw.on")).toHaveCount(targetOn ? 1 : 0); // 列表刷新后开关到位
  }

  // 基线：前台首页能看到该商品
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(card().first()).toBeVisible();

  // 后台真实点击「下架」
  await adminLogin();
  await setShelf(false);

  // 前台实时反映：首页不再出现该商品（Admin 写 → 前台读，三端联动）
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(card()).toHaveCount(0);

  // 后台真实点击「上架」还原
  await adminLogin();
  await setShelf(true);

  // 前台恢复可见（同时清理共享态）
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(card().first()).toBeVisible();
});
