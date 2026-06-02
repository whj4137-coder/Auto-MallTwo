# 接口清单 — Apex Drive Store V2

> **这是什么**：前台/Admin/Demo 全部接口契约，支撑前后端对齐与测试用例生成。
> **字段标准**：每个接口含 9 字段（见 [../project/decisions.md](../project/decisions.md) ADR-0002）。
> **统一信封**：`{ "code": int, "message": string, "data": any }`，`code=0` 为成功。金额字段一律 `priceCents`（分）。
> 错误码语义见 [../product/prd.md](../product/prd.md) §12（REQ-025）；字面值见 [../product/prd.md](../product/prd.md) §10。
>
> **实现状态（2026-05-29，已评审冻结）**：全部接口已在 `apps/server`（Express）落地并联调+自动化测试通过，开发态基址 `http://localhost:3001/api`（dev-guide §2）。路径未加 `/v1` 前缀（直接 `/api/...`）。
>
> **实现增量（changes 0007/0010/0011 已 Accepted）**：
> - **Product.image**（0011）：商品对象含 `image`（`/products/{code}.svg`），首页聚合/类目/详情均返回。
> - **Checkout 响应**（0007）：API-013/014 的 `data` 实物订单增 `receiver{name,phone,address}` 与 `deliveryNote`（会员为 undefined）。
> - **首页聚合**（0001）：`GET /api/home` → `{banners, categories(带 count), featured(homeFeatured 不截断), shelves[{category,products}]}`。
> - **Admin 写操作**（0010）：`POST /api/admin/products`、`PATCH /api/admin/products/:code`、`POST /api/admin/banners`、`PATCH /api/admin/banners/:code`、`PATCH /api/admin/services/:code`；字段校验失败返 **4000**。`API-022/025/026`（Banner/服务/会话）已实现。
> - **搜索**（API-005）：`GET /api/search?q=` 名称 substring，仅实物+会员、仅 published；前端 `/search` 独立页，空结果 COPY-014。

## 公共约定
- **Base / 版本**：`/api/v1`（破坏性变更走 `/api/v2`）。本文路径省略写作 `/api/...` 即 `/api/v1/...`。
- **鉴权**：写入接口需 `Authorization: Bearer <token>`。本期 token 为后端签发的**不透明字符串**（内存有效，无 JWT/refresh）；Demo 走 `POST /api/auth/login`（admin/123456）。重启回 GUEST。
- **Demo 状态头**（写入类必带，供后端门禁）：`X-Demo-Drive: PARKED|DRIVING`、`X-Demo-Net: ONLINE|OFFLINE`。
- **门禁前置**（写入类统一）：`LOGGED_IN AND PARKED AND ONLINE`，违反返回 1001/2001/2002（优先级 DRIVING>OFFLINE>GUEST）。
- **分页**：本期数据量小，**列表一律不分页**（商品/类目/Banner/订单/搜索一次性返回）。如未来需要再引入 cursor 分页。
- **统一错误体**：失败时 `{ code, message, data:null }`；`code` 见 §12 错误码表。

---

## 接口索引

| API | 名称 | Method + Path | 模块 |
|-----|------|---------------|------|
| API-001 | 首页聚合 | GET `/api/home` | 浏览 |
| API-002 | 类目列表 | GET `/api/categories` | 浏览 |
| API-003 | 类目下商品 | GET `/api/categories/{categoryCode}/products` | 浏览 |
| API-004 | 商品详情 | GET `/api/products/{productCode}` | 浏览 |
| API-005 | 搜索 | GET `/api/search?q={kw}` | 浏览 |
| API-006 | 登录 | POST `/api/auth/login` | 鉴权 |
| API-007 | 登出 | POST `/api/auth/logout` | 鉴权 |
| API-008 | 查看购物车 | GET `/api/cart` | 购物车 |
| API-009 | 加入购物车 | POST `/api/cart` | 购物车 |
| API-010 | 修改数量 | PATCH `/api/cart/{itemId}` | 购物车 |
| API-011 | 切换勾选 | PATCH `/api/cart/{itemId}/select` | 购物车 |
| API-012 | 删除项 | DELETE `/api/cart/{itemId}` | 购物车 |
| API-013 | 创建 Checkout | POST `/api/checkout` | 下单 |
| API-014 | 查看 Checkout | GET `/api/checkout/{checkoutId}` | 下单 |
| API-015 | 模拟支付 | POST `/api/checkout/{checkoutId}/pay` | 支付 |
| API-016 | 订单列表 | GET `/api/orders` | 订单 |
| API-017 | 会员状态 | GET `/api/membership` | 会员 |
| API-018 | 我的信息 | GET `/api/me` | 我的 |
| API-019 | Demo 重置 | POST `/api/demo/reset` | Demo |
| API-020 | Admin 登录 | POST `/api/admin/login` | Admin |
| API-021 | Admin 商品管理 | GET/POST/PATCH `/api/admin/products...` | Admin |
| API-022 | Admin Banner 管理 | GET/POST/PATCH `/api/admin/banners...` | Admin |
| API-023 | Admin 订单查询 | GET `/api/admin/orders...` | Admin |
| API-024 | 订单详情 | GET `/api/orders/{orderNo}` | 订单 |
| API-025 | Admin 服务内容管理 | PATCH `/api/admin/services/{svc_code}` | Admin |
| API-026 | Admin 演示会话 | GET/POST `/api/admin/session...` | Admin |

> 编号存在后补插入（API-024/025/026），为避免破坏既有引用暂不重排；查找以本索引为准。

---

## A. 浏览（公开，只读）

### API-001 首页聚合
- **用途**：返回首页 Banner + 快捷类目 + 精选商品 + 车主服务
- **Method+Path**：`GET /api/home`
- **鉴权/门禁**：无
- **入参**：无
- **成功出参**：`data: { banners:[{bannerCode,title,subtitle,target}], categories:[{categoryCode,name,type}], featured:[Product], services:[Product] }`
- **错误码**：5000
- **关联需求**：REQ-001
- **备注**：HERO 固定 banner_001；featured 最多 3 个；services 按 PRD §10.8 三项返回，均仅返回 `published=true`，不补位

### API-002 类目列表
- **用途**：返回 5 个类目
- **Method+Path**：`GET /api/categories`
- **鉴权/门禁**：无 ｜ **入参**：无
- **成功出参**：`data: [{categoryCode,name,type}]`
- **错误码**：5000 ｜ **关联**：REQ-002

### API-003 类目下商品
- **用途**：按类目取商品网格
- **Method+Path**：`GET /api/categories/{categoryCode}/products`
- **鉴权/门禁**：无 ｜ **入参**：path `categoryCode`
- **成功出参**：`data: [Product]`
- **错误码**：4004（类目不存在）、5000 ｜ **关联**：REQ-002

### API-004 商品详情
- **用途**：取单商品详情（含 SKU/会员权益/展示服务文案）
- **Method+Path**：`GET /api/products/{productCode}`
- **鉴权/门禁**：无 ｜ **入参**：path `productCode`
- **成功出参**：`data: Product`（见下方 Product 结构）
- **错误码**：4004、5000 ｜ **关联**：REQ-004/005/006

### API-005 搜索
- **用途**：商品名 substring 搜索
- **Method+Path**：`GET /api/search?q={kw}`
- **鉴权/门禁**：无（前端在 DRIVING/OFFLINE 禁用输入）
- **入参**：query `q`（string，必填）
- **成功出参**：`data: [Product]`（空数组=空结果）
- **错误码**：4000（q 缺失）、5000 ｜ **关联**：REQ-003

---

## B. 鉴权

### API-006 登录
- **用途**：Mock 登录获取 token
- **Method+Path**：`POST /api/auth/login`
- **鉴权/门禁**：无
- **入参**：`{ username:string, password:string }`（必填）
- **成功出参**：`data: { token:string, displayName:"车主用户" }`
- **错误码**：1002（账密错误，前端 LoginDialog 显示 COPY-003）、4000
- **关联**：REQ-020
- **备注**：仅 admin/123456 成功；token 内存有效

### API-007 登出
- **用途**：清除会话（演示可选）
- **Method+Path**：`POST /api/auth/logout`
- **鉴权/门禁**：需登录 ｜ **入参**：无 ｜ **成功出参**：`data:null`
- **错误码**：1001 ｜ **关联**：REQ-016

---

## C. 购物车（写入，门禁）

### API-008 查看购物车
- **用途**：取当前用户购物车
- **Method+Path**：`GET /api/cart`
- **鉴权/门禁**：需登录（行车/断网可只读取）
- **入参**：无
- **成功出参**：`data: { items:[CartItem], selectedTotalCents:int }`
- **错误码**：1001 ｜ **关联**：REQ-010

### API-009 加入购物车
- **用途**：实物加购
- **Method+Path**：`POST /api/cart`
- **鉴权/门禁**：`LOGGED_IN·PARKED·ONLINE`
- **入参**：`{ productCode:string, colorSku:string, capacitySku:string|null, quantity:int[1,5] }`
- **成功出参**：`data: { item:CartItem }`
- **错误码**：1001、2001、2002、**2003（DISPLAY_SERVICE 强制写入）**、4000（数量越界/SKU 非法）、4004、4009（下架/售罄）
- **关联**：REQ-007、REQ-006(C-01)
- **备注**：仅 PHYSICAL 允许；会员/展示服务调用分别 4000/2003；同 SKU 合并且数量截到 5；下架/售罄返回 4009

### API-010 修改数量
- **用途**：改购物车项数量
- **Method+Path**：`PATCH /api/cart/{itemId}`
- **鉴权/门禁**：`LOGGED_IN·PARKED·ONLINE`
- **入参**：`{ quantity:int[1,5] }`
- **成功出参**：`data: { item:CartItem }`
- **错误码**：1001、2001、2002、4000、4004 ｜ **关联**：REQ-010、REQ-031

### API-011 切换勾选
- **用途**：勾选/取消购物车项
- **Method+Path**：`PATCH /api/cart/{itemId}/select`
- **鉴权/门禁**：`LOGGED_IN·PARKED·ONLINE`
- **入参**：`{ selected:boolean }`
- **成功出参**：`data: { item:CartItem, selectedTotalCents:int }`
- **错误码**：1001、2001、2002、4004 ｜ **关联**：REQ-010

### API-012 删除项
- **用途**：删除购物车项（无二次确认）
- **Method+Path**：`DELETE /api/cart/{itemId}`
- **鉴权/门禁**：`LOGGED_IN·PARKED·ONLINE`
- **入参**：path `itemId`
- **成功出参**：`data: { selectedTotalCents:int }`
- **错误码**：1001、2001、2002、4004 ｜ **关联**：REQ-010

---

## D. 下单 / 支付（写入，门禁）

### API-013 创建 Checkout
- **用途**：从购物车勾选项或立即购买/会员开通创建临时订单
- **Method+Path**：`POST /api/checkout`
- **鉴权/门禁**：`LOGGED_IN·PARKED·ONLINE`
- **入参**：
  - `source:"CART"` → `{ source, cartItemIds:[string] }`
  - `source:"BUY_NOW"` → `{ source, productCode, colorSku, capacitySku?, quantity }`
  - 会员 → `{ source:"BUY_NOW", productCode:"mem_xxx", quantity:1 }`
- **成功出参**：`data: { checkoutId, type:"PHYSICAL"|"MEMBERSHIP", items:[...], totalCents, address }`
- **错误码**：1001、2001、2002、2003（展示服务）、4000、4004、4009
- **关联**：REQ-008/009/010/011
- **备注**：BUY_NOW **不影响购物车**（A-02 不变量）；会员 type=MEMBERSHIP，标题用「确认开通」

### API-014 查看 Checkout
- **用途**：取 checkout 明细（确认页/QR 页）
- **Method+Path**：`GET /api/checkout/{checkoutId}`
- **鉴权/门禁**：需登录
- **入参**：path `checkoutId`
- **成功出参**：`data: Checkout`
- **错误码**：1001、4004（失效→前端兜底 COPY-034/035）｜ **关联**：REQ-011/012

### API-015 模拟支付
- **用途**：模拟扫码成功，写订单
- **Method+Path**：`POST /api/checkout/{checkoutId}/pay`
- **鉴权/门禁**：`LOGGED_IN·PARKED·ONLINE`
- **入参**：path `checkoutId`
- **成功出参**：`data: { order:Order }`（order.orderNo=ORDER-P/M-NNN，status=已支付/已开通）
- **错误码**：1001、2001、2002、4004（checkout 失效）、4009（重复支付）
- **关联**：REQ-012/013/009
- **备注**：CART 来源 → 删除已勾选购物车项；MEMBERSHIP → 置 membership=ACTIVE（幂等，REQ-033）

---

## E. 订单 / 会员

### API-016 订单列表
- **用途**：当前用户订单（时间降序）
- **Method+Path**：`GET /api/orders`
- **鉴权/门禁**：需登录（行车/断网可只读）
- **入参**：无 ｜ **成功出参**：`data: [Order]`（空=空状态）
- **错误码**：1001 ｜ **关联**：REQ-014
- **备注**：不分页；订单卡可点击进入 P13，详情由 API-024 提供

### API-024 订单详情
- **用途**：取单个订单详情（订单中心点卡进入 P13）
- **Method+Path**：`GET /api/orders/{orderNo}`
- **鉴权/门禁**：需登录（行车/断网可只读）
- **入参**：path `orderNo`（如 ORDER-P-001）
- **成功出参**：`data: Order`（含 items / totalCents / status / createdAt / address 或 membership）
- **错误码**：1001、4004（订单不存在）｜ **关联**：REQ-034
- **备注**：只读；无再次支付/取消等写入

### API-017 会员状态
- **用途**：取 membership 当前状态
- **Method+Path**：`GET /api/membership`
- **鉴权/门禁**：无（"我的"页不论登录都展示，状态实时）
- **入参**：无 ｜ **成功出参**：`data: { status:"ACTIVE"|"INACTIVE", boundVehicle:"特斯拉 Model Y", orderNo?:string }`
- **错误码**：5000 ｜ **关联**：REQ-005/015/033

### API-018 我的信息
- **用途**：账号/车辆/地址/会员 固定 Mock
- **Method+Path**：`GET /api/me`
- **鉴权/门禁**：无（始终返回固定 Mock）
- **入参**：无
- **成功出参**：`data: { account, vehicle, address, membership }`（值见 PRD §10.4）
- **错误码**：5000 ｜ **关联**：REQ-015

---

## F. Demo 控制

### API-019 Demo 重置
- **用途**：清空可变数据并复位
- **Method+Path**：`POST /api/demo/reset`
- **鉴权/门禁**：无（任何状态可调，无二次确认；Demo Bar 不被门禁拦截）
- **入参**：无
- **成功出参**：`data:null`
- **错误码**：5000
- **关联**：REQ-019
- **备注**：清 cart/checkout/orders/membership；seqP/seqM 归 0；保留种子数据。前端另行清 TokenStore+session 并跳首页

---

## G. Admin（管理接口）

> 说明：前台只读接口（API-001..005）默认**只返回 `published=true`** 的项；Admin 接口返回全部（含下架）。

### API-020 Admin 登录
- `POST /api/admin/login` ｜ 无门禁 ｜ 入参 `{username,password}` ｜ 出参 `{token}` ｜ 错误 1002/4000 ｜ REQ-036

### API-021 Admin 商品管理（CRUD + 上下架）
- 列表 `GET /api/admin/products`（全部，含下架）
- 详情 `GET /api/admin/products/{code}`
- 新增 `POST /api/admin/products`
- 编辑 `PATCH /api/admin/products/{code}`（名/价/图/详情/SKU/库存/分类/排序）
- 上下架 `PATCH /api/admin/products/{code}/shelf` 入参 `{published:boolean}`
- 需 admin 登录 ｜ 错误 1001/4000/4004 ｜ REQ-037/035 ｜ 备注：改动前台实时读

### API-022 Admin Banner 管理（CRUD + 上下架）
- `GET/POST /api/admin/banners`、`PATCH/DELETE /api/admin/banners/{code}`、`PATCH .../{code}/shelf`；可配 `target`(实物/会员/展示/分类) 与 `sortOrder`
- 需 admin 登录 ｜ 错误 1001/4000/4004 ｜ REQ-038

### API-025 Admin 服务内容管理
- 会员：`PATCH /api/admin/products/{mem_code}`（权益文案/价格/详情）+ shelf
- 展示服务：`PATCH /api/admin/services/{svc_code}`（介绍/暂未开放说明/后续能力说明）+ shelf
- 需 admin 登录 ｜ 错误 1001/4000/4004 ｜ REQ-039

### API-023 Admin 订单查询
- 列表 `GET /api/admin/orders?type=&status=`（类型/状态筛选）；详情 `GET /api/admin/orders/{orderNo}`
- 出参含 用户/绑定车辆/金额/时间/模拟支付状态 ｜ 需 admin 登录 ｜ 错误 1001/4004 ｜ REQ-040

### API-026 Admin 演示会话
- `GET /api/admin/session`：返回 `{auth, drive, net, cartCount, checkout, orderCount, membership}`
- 可选 `POST /api/admin/session/reset`（等价 Demo 重置）
- 需 admin 登录 ｜ 错误 1001 ｜ REQ-041

> **结算下架/售罄校验**：写入接口（API-009 加购 / API-013 创建 checkout）校验商品状态——`published=false`（下架）或 `stock=SOLD_OUT`（售罄）→ 返回 `4009`（前端提示 下架 COPY-045 / 售罄 COPY-046）；历史订单不受影响（REQ-035/042）。

---

## 数据模型（核心实体）

> 字面值真值见 PRD §10；本节定义**字段与关系**。所有金额为 `priceCents`（分）。无真实 Payment 实体（支付即 mock，写 Order）。库存为展示字段不扣减。

| 实体 | 关键字段 | 关系/说明 |
|------|----------|-----------|
| **Category** | categoryCode, name, type(PHYSICAL/MEMBERSHIP/DISPLAY_SERVICE), published, sortOrder | 5 个种子 |
| **Product** | productCode, categoryCode, type, name, subtitle, priceCents(展示服务为 null), colorSkus[], capacitySkus[], homeFeatured, published, sortOrder, stock(IN_STOCK/SOLD_OUT), assetKey, detailText, delivery{tag,note}, membership{validDays,benefits[],boundVehicle}, display{buttonText,note} | 按 type 取不同子字段；属 Category；售罄=stock SOLD_OUT 仍展示不可买；字段级规则见 PRD §15.5 |
| **Banner** | bannerCode, title, subtitle, targetType(PRODUCT/CATEGORY), targetCode, published, sortOrder | 3 个种子；targetCode 须存在，见 PRD §15.5.2 |
| **User** | username(admin), displayName(车主用户), phoneMasked(138****5678) | 固定 Mock |
| **Address** | receiver(张先生), phoneMasked, detail, label(默认地址) | 固定只读 |
| **Vehicle** | name(特斯拉 Model Y), plateMasked(沪A·****5), color(珍珠白) | 固定只读 |
| **CartItem** | itemId, productCode, name, colorSku, capacitySku, quantity[1,5], unitPriceCents, selected | 同 SKU 合并；仅 PHYSICAL |
| **Checkout** | checkoutId, source(CART/BUY_NOW), type(PHYSICAL/MEMBERSHIP), items[], totalCents, address|vehicle | 临时；BUY_NOW 不影响购物车 |
| **Order** | orderNo(ORDER-P/M-NNN), type, items[OrderItem], totalCents, status(已支付/已开通), createdAt | seqP/seqM 独立递增 |
| **OrderItem** | productCode, name, colorSku, capacitySku, quantity, snapshotPriceCents | 下单快照 |
| **Membership** | status(INACTIVE/ACTIVE), boundVehicle, orderNo? | 全局单一，月/年卡互斥 |
| **DemoSession** | auth, drive, net, cartCount, checkout, orderCount, membership | 演示会话（Admin §F 可读） |

```jsonc
// 示例
Product = { "productCode":"phy_car_001","categoryCode":"cat_car_goods","type":"PHYSICAL","name":"磁吸手机支架","subtitle":"曜石黑，舒适触达","priceCents":12900,"colorSkus":["曜石黑","银灰"],"capacitySkus":null,"homeFeatured":true,"published":true,"sortOrder":1,"delivery":{"tag":"标准配送","note":"预计 2-3 个工作日送达（演示）","stock":"库存充足"} }
CartItem = { "itemId":"c1","productCode":"phy_car_001","name":"磁吸手机支架","colorSku":"曜石黑","capacitySku":null,"quantity":1,"unitPriceCents":12900,"selected":true }
Order = { "orderNo":"ORDER-P-001","type":"PHYSICAL","items":[{ "productCode":"phy_car_001","name":"磁吸手机支架","colorSku":"曜石黑","quantity":1,"snapshotPriceCents":12900 }],"totalCents":12900,"status":"已支付","createdAt":"2026-05-29T10:00:00" }
```

---

## 接口契约详例（请求/响应 JSON）

> 全部响应包统一信封 `{code,message,data}`；下例只展开 `data`（成功 code=0）。金额字段 `*Cents`（整数分）。写入接口请求头另带 `Authorization`、`X-Demo-Drive`、`X-Demo-Net`（见公共约定）。

```jsonc
// ── A 浏览 ──
// API-001 GET /home
data = {
  banners: [{ bannerCode:"banner_001", title:"稳固出行装备", subtitle:"磁吸手机支架，舒适触达", targetType:"PRODUCT", targetCode:"phy_car_001", assetKey:"banner_001" }],
  categories: [{ categoryCode:"cat_car_goods", name:"车品", type:"PHYSICAL" }, /* 5 个 */],
  featured: [ /* Product，≤3，homeFeatured且published */ ],
  services: [ /* §10.8 三项：svc_charge_001 / svc_life_001 / mem_002 */ ]
}
// API-003 GET /categories/cat_car_goods/products
data = [ { productCode:"phy_car_001", name:"磁吸手机支架", subtitle:"曜石黑，舒适触达", priceCents:12900, type:"PHYSICAL", colorSkus:["曜石黑","银灰"], capacitySkus:null, published:true, sortOrder:1, stock:"IN_STOCK", assetKey:"phy_car_001" } ]
// API-004 GET /products/phy_ele_001
data = { productCode:"phy_ele_001", categoryCode:"cat_electronics", type:"PHYSICAL", name:"行车记录仪 Mini", subtitle:"高清夜视", priceCents:49900, colorSkus:["黑色"], capacitySkus:["64G","128G"], homeFeatured:true, published:true, sortOrder:1, stock:"IN_STOCK", assetKey:"phy_ele_001", detailText:"…", delivery:{ tag:"标准配送", note:"预计 2-3 个工作日送达（演示）" } }
// API-005 GET /search?q=磁吸
data = [ /* Product[]，仅 PHYSICAL/MEMBERSHIP 且 published；q 为空→4000 */ ]

// ── B 鉴权 ──
// API-006 POST /auth/login
req  = { username:"admin", password:"123456" }
data = { token:"opaque-xxxx", displayName:"车主用户" }            // 密码错→code 1002,message 账号或密码不正确

// ── C 购物车 ──
// API-008 GET /cart
data = { items:[{ itemId:"c1", productCode:"phy_car_001", name:"磁吸手机支架", colorSku:"曜石黑", capacitySku:null, quantity:1, unitPriceCents:12900, selected:true }], selectedTotalCents:12900 }
// API-009 POST /cart
req  = { productCode:"phy_car_001", colorSku:"曜石黑", capacitySku:null, quantity:1 }
data = { item:{ itemId:"c1", productCode:"phy_car_001", name:"磁吸手机支架", colorSku:"曜石黑", capacitySku:null, quantity:1, unitPriceCents:12900, selected:true } }
// 失败：会员→4000；展示服务→2003；下架/售罄→4009{reason:"DELISTED"|"SOLD_OUT"}；数量越界→4000
// API-010 PATCH /cart/c1   req={ quantity:3 }   data={ item:{…} }
// API-011 PATCH /cart/c1/select   req={ selected:false }   data={ item:{…}, selectedTotalCents:0 }
// API-012 DELETE /cart/c1   data={ selectedTotalCents:0 }

// ── D 下单/支付 ──
// API-013 POST /checkout
req(CART)     = { source:"CART", cartItemIds:["c1"] }
req(BUY_NOW)  = { source:"BUY_NOW", productCode:"phy_ele_001", colorSku:"黑色", capacitySku:"128G", quantity:2 }
req(会员)     = { source:"BUY_NOW", productCode:"mem_001", quantity:1 }
data = { checkoutId:"ck1", source:"BUY_NOW", type:"PHYSICAL", items:[{ productCode:"phy_ele_001", name:"行车记录仪 Mini", colorSku:"黑色", capacitySku:"128G", quantity:2, unitPriceCents:49900 }], totalCents:99800, address:{ receiver:"张先生", detail:"上海浦东新区张江中科路1730号", label:"默认地址" } }
// 失败：含下架→4009{reason:"DELISTED"}；售罄→4009{reason:"SOLD_OUT"}；无勾选→4000；展示服务→2003
// API-014 GET /checkout/ck1   data=Checkout（失效→4004，前端 COPY-034/035）
// API-015 POST /checkout/ck1/pay   req=∅
data = { order:{ orderNo:"ORDER-P-001", type:"PHYSICAL", items:[{ productCode:"phy_ele_001", name:"行车记录仪 Mini", colorSku:"黑色", capacitySku:"128G", quantity:2, snapshotPriceCents:49900 }], totalCents:99800, status:"已支付", createdAt:"2026-05-29T10:00:00", address:{…} } }
// 失败：checkout 不存在→4004(COPY-035)；已支付→4009{reason:"ALREADY_PAID"}

// ── E 订单/会员/我的 ──
// API-016 GET /orders   data=[ Order ]（时间降序）
// API-024 GET /orders/ORDER-M-001
data = { orderNo:"ORDER-M-001", type:"MEMBERSHIP", items:[{ productCode:"mem_001", name:"悦行会员月卡", quantity:1, snapshotPriceCents:3900 }], totalCents:3900, status:"已开通", createdAt:"…", membership:{ validDays:30, boundVehicle:"特斯拉 Model Y" } }
// API-017 GET /membership   data={ status:"ACTIVE", boundVehicle:"特斯拉 Model Y", orderNo:"ORDER-M-001" }
// API-018 GET /me
data = { account:{ username:"admin", displayName:"车主用户", phoneMasked:"138****5678" }, vehicle:{ name:"特斯拉 Model Y", plateMasked:"沪A·****5", color:"珍珠白" }, address:{ receiver:"张先生", detail:"上海浦东新区张江中科路1730号", label:"默认地址" }, membership:{ status:"INACTIVE" } }

// ── F Demo ──
// API-019 POST /demo/reset   data=null（清 cart/checkout/orders/membership、seq 归零、保留内容编辑）

// ── G Admin ──
// API-020 POST /admin/login   req={ username,password }   data={ token }
// API-021 商品管理
GET    /admin/products            data=[ Product ]（含下架）
POST   /admin/products           req=Product（productCode/type 必填且创建后不可改）→ data=Product
PATCH  /admin/products/{code}    req=部分字段（§15.5.1 可改集）→ data=Product
PATCH  /admin/products/{code}/shelf   req={ published:true|false }   data=Product
// API-022 Banner：GET/POST/PATCH /admin/banners[/{code}]   req/data 含 targetType+targetCode+sortOrder+published
// API-025 服务：PATCH /admin/services/{svc_code}   req={ name?,subtitle?,detailText?,display:{note?},published?,sortOrder? }（buttonText 固定 COPY-006）
// API-023 订单：GET /admin/orders?type=PHYSICAL&status=已支付   data=[ Order ]；GET /admin/orders/{orderNo}   data=Order
// API-026 会话：GET /admin/session   data={ auth,drive,net,cartCount,selectedCartCount,checkout,orderCount,membership,seqP,seqM }；POST /admin/session/reset 等价 API-019
```

> 字段级可改性/必填/校验见 PRD §15.5；后端处理顺序与业务校验见 PRD §15.10。

---

## 接口 × 错误码速查

| 接口 | 1001 | 2001 | 2002 | 2003 | 4000 | 4004 | 4009 |
|------|------|------|------|------|------|------|------|
| API-009 加购 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | |
| API-010 改数量 | ✓ | ✓ | ✓ | | ✓ | ✓ | |
| API-011 勾选 | ✓ | ✓ | ✓ | | | ✓ | |
| API-012 删除 | ✓ | ✓ | ✓ | | | ✓ | |
| API-013 checkout | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| API-015 支付 | ✓ | ✓ | ✓ | | | ✓ | ✓ |
| API-006 登录 | | | | | ✓ | | （1002） |
