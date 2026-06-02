# 前端实现规格（状态 / Store / 门禁 / API 客户端）— Apex Drive Store V2

> **这是什么**：前端「可直接编码」的状态层规格（HOW）。业务真值以 [../product/prd.md](../product/prd.md) 为准（尤其 §10/§11/§15），本文件只定义 store 形状、actions、与 API 的读写映射、门禁与 API 客户端。
> **栈**：React + TS + Vite + Zustand（ADR-0004）。所有金额字段 `*Cents`（整数分），仅渲染层除 100。
> **PRD 镜像**：摘要见 PRD §15.19；本文件为权威完整版。

---

## 1. 共享类型（packages/shared，源自 PRD §10.7）

```ts
type Auth = 'GUEST' | 'LOGGED_IN';
type Drive = 'PARKED' | 'DRIVING';
type Net = 'ONLINE' | 'OFFLINE';
type ProductType = 'PHYSICAL' | 'MEMBERSHIP' | 'DISPLAY_SERVICE';
type CheckoutSource = 'CART' | 'BUY_NOW';
type Membership = 'INACTIVE' | 'ACTIVE';
type Published = boolean;
type Stock = 'IN_STOCK' | 'SOLD_OUT';
type OrderType = 'PHYSICAL' | 'MEMBERSHIP';
type OrderStatus = '已支付' | '已开通';

interface ApiEnvelope<T> { code: number; message: string; data: T | null; }

interface Product {
  productCode: string; categoryCode: string; type: ProductType;
  name: string; subtitle?: string; priceCents: number | null;
  colorSkus?: string[]; capacitySkus?: string[];
  homeFeatured: boolean; published: Published; sortOrder: number; stock?: Stock;
  assetKey?: string; detailText?: string;
  delivery?: { tag: string; note: string };
  membership?: { validDays: number; benefits: string[]; boundVehicle: string };
  display?: { buttonText: string; note: string };
}
interface CartItem { itemId: string; productCode: string; name: string; colorSku: string; capacitySku: string | null; quantity: number; unitPriceCents: number; selected: boolean; }
interface Checkout { checkoutId: string; source: CheckoutSource; type: OrderType; items: CheckoutItem[]; totalCents: number; address?: Address; vehicle?: Vehicle; }
interface Order { orderNo: string; type: OrderType; items: OrderItem[]; totalCents: number; status: OrderStatus; createdAt: string; address?: Address; membership?: { validDays: number; boundVehicle: string }; }
```

> 完整字段以 PRD §10 + api-spec 数据模型为准；展示服务 priceCents=null。

---

## 2. Store 清单（Zustand，前台）

> 约定：每个 store 列 **state 字段** / **actions（含调用的 API）** / **被哪些页面读**。门禁判断统一走 GateGuard（§4），store 的写 action 内部假定已通过门禁或交由调用方先 guard。

### 2.1 sessionStore（会话与门禁状态）
| state | 类型 | 默认 | 说明 |
|-------|------|------|------|
| auth | Auth | GUEST | 仅 Demo Bar 切换 |
| drive | Drive | PARKED | 仅 Demo Bar 切换 |
| net | Net | ONLINE | 仅 Demo Bar 切换 |
| token | string\|null | null | API-006 登录后写入；内存态 |
| pendingAction | PendingAction\|null | null | 见 PRD §15.15.3 |

| action | 调用 API | 数据变化 | 备注 |
|--------|----------|----------|------|
| setAuth/setDrive/setNet | — | 改对应状态 | Demo Bar；不自动触发 |
| login(username,password) | API-006 | token 写入；auth=LOGGED_IN | 失败 1002→保留弹窗 |
| logout() | API-007 | token=null；auth=GUEST | 后端 cart/orders/membership 保留 |
| setPending(a)/clearPending() | — | pendingAction | 登录续作 |
| resetSession() | — | 回默认 GUEST/PARKED/ONLINE，token=null | Demo 重置时调 |

读取页面：全部页面 + GateGuard + Demo Bar（REQ-016/017/018/032）。

### 2.2 catalogStore（商品域，只读）
| state | 说明 |
|-------|------|
| home | API-001 返回 {banners,categories,featured,services} |
| categories | API-002 |
| productsByCategory: Record<code,Product[]> | API-003 缓存 |
| productCache: Record<code,Product> | API-004 缓存 |
| searchResults | API-005 |

actions：`fetchHome()`(API-001) / `fetchCategories()`(API-002) / `fetchCategoryProducts(code)`(API-003) / `fetchProduct(code)`(API-004) / `search(q)`(API-005)。
读取页面：P1/P2/P3/P4/P5。规则：前台只读接口仅返回 published=true（PRD §15.10.2）。

### 2.3 cartStore（购物车）
| state | 说明 |
|-------|------|
| items: CartItem[] | API-008 |
| selectedTotalCents | 后端返回或前端按 selected 计算 |

| action | API | 说明 |
|--------|-----|------|
| fetchCart() | API-008 | 进入 P6 |
| addItem({productCode,colorSku,capacitySku,quantity}) | API-009 | 同 SKU 合并（PRD §15.10.3） |
| setQuantity(itemId,q) | API-010 | q∈[1,5] |
| toggleSelect(itemId,selected) | API-011 | |
| removeItem(itemId) | API-012 | 无二次确认 |

读取页面：P6、SideNav badge（如实现）。门禁：写操作需 LOGGED_IN+PARKED+ONLINE；只读可看。

### 2.4 checkoutStore（临时结算）
| state | 说明 |
|-------|------|
| current: Checkout\|null | API-013 创建 / API-014 取 |

actions：`createFromCart(cartItemIds)`(API-013 source=CART) / `createBuyNow({productCode,colorSku?,capacitySku?,quantity})`(API-013 source=BUY_NOW) / `createMembership(productCode)`(API-013 type=MEMBERSHIP) / `fetch(checkoutId)`(API-014) / `clear()`。
读取页面：P7/P8。规则：创建即后端重算金额、校验 published/stock（PRD §15.10.4）。

### 2.5 orderStore（订单）
| state | 说明 |
|-------|------|
| list: Order[] | API-016（时间降序） |
| current: Order\|null | API-024 / API-015 返回缓存 |
| lastOrderNo | 支付成功后高亮用 |

actions：`pay(checkoutId)`(API-015→生成 Order) / `fetchOrders()`(API-016) / `fetchOrder(orderNo)`(API-024)。
读取页面：P9/P10/P13。pay 成功副作用：CART 来源删已勾选项（刷新 cartStore）、会员置 ACTIVE（刷新 membershipStore）。

### 2.6 membershipStore
| state | 说明 |
|-------|------|
| status: Membership | API-017 |
| boundVehicle | 特斯拉 Model Y |
| orderNo? | 已开通的会员订单号 |

actions：`fetch()`(API-017)。读取页面：P4/P11。规则：全局单一、月/年卡互斥、幂等（REQ-033）。

### 2.7 meStore
state：`account/vehicle/address/membership`（API-018，固定 Mock）。读取页面：P11。

### 2.8 uiStore（toast / 弹窗）
| state | 说明 |
|-------|------|
| toast: {text,kind}\|null | 单条；2.5s；按优先级覆盖（REQ-029） |
| loginDialogOpen | LoginDialog 显隐 |
| skeleton: Record<page,boolean> | 首次加载骨架 |

actions：`showToast(copyId)` / `openLogin(pending?)` / `closeLogin()`。

---

## 3. Admin Store（/admin/*）
- `adminSessionStore`：adminToken、login(API-020)。
- `adminProductStore`：list/get/create/update/setShelf/setStock/setSort（API-021）。
- `adminBannerStore`：list/create/update/setShelf/sort（API-022）。
- `adminServiceStore`：会员/展示服务编辑（API-025）。
- `adminOrderStore`：list(filter)/detail（API-023）。
- `adminDemoSessionStore`：get/reset（API-026）。
字段级校验规则见 PRD §15.5；保存后前台下一次读取生效（PRD §15.5.4）。

---

## 4. GateGuard（门禁，PRD §3.2 / §15.1）

```ts
type GateReason = 'DRIVING' | 'OFFLINE' | 'GUEST' | null;
function checkGate(s: {auth:Auth;drive:Drive;net:Net}): {allowed:boolean; reason:GateReason} {
  if (s.drive === 'DRIVING') return { allowed:false, reason:'DRIVING' };   // 优先级最高
  if (s.net === 'OFFLINE')   return { allowed:false, reason:'OFFLINE' };
  if (s.auth === 'GUEST')    return { allowed:false, reason:'GUEST' };
  return { allowed:true, reason:null };
}
// 写入入口统一：
function guardWrite(action: PendingAction) {
  const { allowed, reason } = checkGate(session);
  if (reason === 'DRIVING') return ui.showToast('COPY-001');        // 不发请求
  if (reason === 'OFFLINE') return ui.showToast('COPY-002');        // 不发请求
  if (reason === 'GUEST')   { session.setPending(action); return ui.openLogin(); }
  return run(action);                                               // 通过→执行
}
```
- 按钮置灰：`!checkGate(session).allowed` 时交易按钮 disabled（alpha 降），但 Demo Bar 自身永不置灰。
- 登录续作：login 成功后若有 pendingAction → run(pending) → clearPending（无论成败都清，PRD §15.15.3）。

---

## 5. API 客户端（PRD §15.10.1 / api-spec 公共约定）
- Base：`VITE_PUBLIC_API_BASE`（默认 `http://localhost:3001/api/v1`）。
- 请求头：写入接口注入 `Authorization: Bearer <token>`、`X-Demo-Drive`、`X-Demo-Net`（取自 sessionStore）。
- 超时：连接 10s / 读 15s / 写 15s（PRD §12.2）。
- 响应处理（统一信封 `{code,message,data}`）：

| code | 客户端行为 |
|------|-----------|
| 0 | 返回 data |
| 1001 | uiStore.openLogin()（记 pending） |
| 1002 | LoginDialog 内显 COPY-003 |
| 2001/2002 | showToast COPY-001/002 |
| 2003 | showToast COPY-039 |
| 4000 | showToast(message) |
| 4004 | showToast COPY-036 |
| 4009 | 下架→COPY-045 / 售罄→COPY-046 / 重复支付→message（按 data.reason 区分） |
| 5000 | showToast COPY-037 |
| 网络层失败/超时 | showToast COPY-038 |

> 前端在 GateGuard 已拦截的写入不会发请求；后端 2001/2002/2003 为兜底（强制调用/测试用）。

---

## 6. 数据加载时机（对齐 PRD §15.9）
| 页面 | 进入时加载 | store |
|------|-----------|-------|
| P1 | fetchHome | catalog |
| P2 | fetchCategories + fetchCategoryProducts(默认首类) | catalog |
| P3/P4/P5 | fetchProduct(code)（P4 另 fetch membership） | catalog/membership |
| P6 | fetchCart | cart |
| P7/P8 | fetch(checkoutId) | checkout |
| P9 | API-015 返回缓存 / fetchOrder | order |
| P10 | fetchOrders | order |
| P11 | meStore + membership | me/membership |
| P13 | fetchOrder(orderNo) | order |

> 返回顶层页（P1/P2/P10）时重新拉取，保证 Admin 改动实时可见（PRD §15.5.4）。
