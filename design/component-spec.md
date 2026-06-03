# 组件清单与字段绑定 — Apex Drive Store V2

> **这是什么**：每个页面「由哪些组件/区块构成、本地态、API 字段 → UI 元素的绑定」，供前端拆组件、绑数据。
> **真值**：文案 PRD §11、字面值 PRD §10、视觉 [design-tokens.md](design-tokens.md)、契约 [api-spec.md](api-spec.md) + `@apex/shared` 类型、状态 [../engineering/frontend-spec.md](../engineering/frontend-spec.md)。
> **本文件以 `apps/web` 实现为准**（2026-06-02 按运行界面校准）。字段名一律取 `packages/shared/src/types.ts`。页面多为单组件 + 语义化 className，下表「区块」对应 JSX 结构而非独立 React 组件。
> 若与 PRD §15.9 描述有出入，以运行代码为准，§15.9 的同步需走 [openspec](../openspec/README.md) 提案。

---

## 0. 全局 / 通用（App Shell）

| 区块/组件 | 数据来源 | 绑定/行为 |
|------|----------|-----------|
| `AppShell` | — | 组合 DemoBar + SideNav + `<main>` 内容区 + Toast + LoginDialog |
| `DemoBar` | sessionStore.auth/drive/net | 三组开关（驻车/行车 · 在线/断网 · 已登录/未登录）→ setDrive/setNet/setAuth；右侧状态文案「STATUS {auth}·{drive}·{net} · CART {n}」(REQ-032)；「重置数据」→ API-019；自身不被门禁拦截 |
| `SideNav` | 路由 | 5 项：首页/分类/购物车/订单/我的；当前项高亮；购物车/订单在 GUEST 态点击 → openLogin |
| `LoginDialog`(P12) | sessionStore | 预填 admin/123456；登录→API-006；1002→COPY-003；点遮罩不关；成功后 run(pendingAction) |
| `GatedButton` | lib/gate `guardWrite` | 写操作按钮统一包裹：DRIVING→toast COPY-001、OFFLINE→toast COPY-002、GUEST→openLogin 续作；命中只读则不发请求 |
| `ProductMedia` | product.image | `<img src=image>`，加载失败/缺省回退类型矢量图标（Glyph）。首页 rail/货架、P2/P3 大图使用；购物车/订单缩略图直接用 Glyph 图标（不取 image） |
| `Glyph` | — | 内置 SVG 图标集（box/star/bolt/phone/search/mic/cart/doc/check/back…） |
| `yuan(cents)` | — | 渲染 `¥{cents/100}` 整数（§10.6），渲染层除以 100 |
| `Toast` | uiStore.toast | 单条、按优先级覆盖（REQ-029）；文案取 §11 |
| 空态 | — | `.empty`（图标 + 文案 COPY-012/013/014 + 可选按钮 COPY-040/041/015） |

---

## 1. 前台页面 × 字段绑定（apps/web/src/pages）

### P1 首页 `Home.tsx`（路由 `/`）
区块：顶栏（标题 + 搜索框）/ `bento`（hero + 两张 promo）/ `cats`（类目条）/ `frail`（精选 rail）/ `catzone`（分类货架）
| UI 区块 | 绑定（API-001 `HomeData`） | 行为 |
|---------|----------------------------|------|
| 搜索框 | 占位文案（静态） | 点击→`/search`；mic 点击→toast COPY-004（不展开输入） |
| hero（Bento 左大块） | `banners[0]`.title/subtitle；CTA 价格取该 banner 目标商品 priceCents | 文案 `立即购买 ¥{price} →`(COPY-020)；点击→目标商品详情 |
| promo ×2（Bento 右） | `banners` 中 `banner_002`(SERVICE)、`banner_003`(MEMBER) 的 title/subtitle | 点击→各自 targetProductCode 详情 |
| 类目条 `cats` | `categories[]`.name + `.count` | 点击→`/category?cat={categoryCode}` |
| 精选 rail `frail` | `featured[]`（published + homeFeatured） | bigcard：ProductMedia / kk(PHYSICAL\|MEMBER) / name / `¥price` / 查看→ → 详情 |
| 分类货架 `catzone` | `shelves[]`（{category, products}，仅 published） | 每段标题 name + categoryCode + `{n} 件`；scard：name / 颜色[0] 或「服务展示」/ 价格 / SOLD_OUT→COPY-046 pill |

### P2 分类 `Category.tsx`（`/category?cat=`）
区块：左 `cat` 过滤列（200px）/ 右 2 列 `bigcard` 网格（内滚）
| UI | 绑定 | 行为 |
|----|------|------|
| 过滤列 | API-002 `categories[]`.name/type；本地 active=`?cat` | 点击→改 `?cat`；当前高亮；默认取第一个类目 |
| 商品大卡 | API-003 `.products[]`（published） | ProductMedia / kk(PHYSICAL\|MEMBER\|SERVICE) / name / meta / 价格；meta=服务展示 \| 有效期 N 天 \| 颜色拼接 \| 标准配送；点击→详情（PHYSICAL→P3 / MEMBERSHIP→P4 / DISPLAY_SERVICE→P5）；SOLD_OUT→COPY-046 |

### P3 实物详情 `ProductDetail.tsx`（`/product/:code`）
区块：返回栏 / 左大图 `limg` / 右列 `rcol`（name/价格/颜色/容量/数量/配送/操作）
| UI | 绑定（API-004 `Product`） | 行为/本地态 |
|----|---------------------------|-------------|
| 返回 | — | COPY-044；`nav(-1)` |
| 大图 | ProductMedia(image) | |
| 名称/价格 | name；`priceCents × qty` | qty 改动价格实时；SOLD_OUT→COPY-046 pill |
| 颜色 | `colors[]`；本地 color=colors[0] | 选项高亮；不改价 |
| 容量 | `capacities[]`（可空）；本地 cap=capacities[0] | |
| 数量 | 本地 qty=1，`.stepper` [1,5] | 到 1「−」灰、到 5「+」灰（REQ-031） |
| 配送 | `deliveryNote` ?? 「标准配送」 | |
| 加入购物车 | GatedButton **主按钮**（`.btn`） | guardWrite→cartStore.add；售罄 disabled；COPY-021 |
| 立即购买 | GatedButton **次按钮**（`.btn ghost`） | guardWrite→createCheckout(BUY_NOW)→P7；售罄 disabled；COPY-020 |

### P4 会员详情 `Membership.tsx`（`/membership/:code`）
区块：返回 / 左渐变会员卡 / 右列（name/价格/权益/绑定车辆/操作）
| UI | 绑定（API-004 + membershipStore） | 行为 |
|----|-----------------------------------|------|
| 会员卡 | name / boundVehicle / `有效期 {validDays} 天` | 渐变样式 |
| 权益 | `benefits[]` | 逐条 ✓ |
| 绑定车辆 | `boundVehicle` | |
| 主按钮 | membershipStore.status | INACTIVE→COPY-022 guardWrite(BUY_NOW)→P7；ACTIVE→COPY-023→`/orders` |

### P5 展示服务详情 `ServiceDetail.tsx`（`/service/:code`）
| UI | 绑定（API-004） | 行为 |
|----|----------------|------|
| 名称/介绍 | name / `serviceDesc` | |
| 按钮 | 禁用 `.btn dis` COPY-006 | 灰、不发写入（C-01） |
| 页脚说明 | COPY-042 | |

### P6 购物车 `Cart.tsx`（`/cart`）
区块：左列表 `.left scroll`（CartRow×N）/ 右 `summary` / 空态
| UI | 绑定（API-008 / cartStore） | 行为 |
|----|------------------------------|------|
| CartRow 勾选 | `items[].selected` | guardWrite→toggle(API-011) |
| CartRow 缩略图 | Glyph 图标（非 image） | |
| CartRow 名/SKU/小计 | name / `[color,capacity]` / `unitPriceCents × qty` | |
| CartRow 数量 | `items[].qty` | guardWrite→setQty(API-010) `.stepper` [1,5] |
| CartRow 删除 | — | guardWrite→remove(API-012)，无二次确认 |
| 订单摘要 | `selectedTotalCents`；收货人取 API-018 `/me` `receiver.name` | 配送方式「标准配送」；前往结算 COPY-025→guardWrite→API-013(CART)→P7；selectedTotal=0 时禁用 |
| 空态 | items=[] | COPY-012 + COPY-040 |

### P7 确认订单 `Confirm.tsx`（`/confirm/:id`）
| UI | 绑定（API-014 `Checkout`） | 行为 |
|----|----------------------------|------|
| 标题 | type | 实物 COPY-030 / 会员 COPY-031 |
| 收货信息 | `checkout.receiver`（仅实物，后端注入）name/phone/address | 只读 |
| 商品清单 | `checkout.lines[]` name/[color,capacity]/qty/`lineTotalCents` | |
| 配送说明 | `checkout.deliveryNote`（仅实物） | |
| 支付摘要 | `checkout.totalCents` | 去支付 COPY-024→guardWrite→P8；checkout 失效→COPY-034 |

### P8 扫码支付 `Pay.tsx`（`/pay/:id`）
| UI | 绑定（API-014） | 行为 |
|----|----------------|------|
| 金额 | `totalCents` 大字 | |
| QR | 占位图 | |
| 说明 | COPY-009 | |
| 订单明细 | `lines[]` name/qty/`lineTotalCents` | |
| 模拟扫码成功 | GatedButton COPY-010 | guardWrite→API-015→落单→`/result`（router state 传 order+type）；失效 COPY-035 / 重复支付 4009 |
| 取消并返回 | COPY-011 | `nav(-1)`，不删 checkout |

### P9 支付结果 `Result.tsx`（`/result`）
> 数据来自上一步的 **router `location.state`**（`{order, type}`），非接口拉取。
| UI | 绑定 | 行为 |
|----|------|------|
| 成功图标 | — | |
| 标题 | state.type | 实物 COPY-028 / 会员 COPY-029 |
| 订单卡 | order.orderNo / `totalCents` / 标签 | 实物 COPY-032 / 会员 COPY-033 |
| 返回首页 / 查看订单 | — | COPY-027→`/`；COPY-026→`/orders` |

### P10 订单中心 `Orders.tsx`（`/orders`）
| UI | 绑定（API-016，时间降序） | 行为 |
|----|---------------------------|------|
| OrderCard | Glyph(star\|box) / `lines[0].name`(+「等 N 件」) / orderNo · createdAt / `totalCents` / 标签(COPY-032\|033) | 点击→`/orders/{orderNo}`（P13） |
| 空态 | list=[] | COPY-013 + COPY-041 |
| GUEST | — | 进入即 openLogin，登录后加载 |

### P11 我的 `Mine.tsx`（`/mine`）
区块：2×2 四张 `card`，字段取 API-018 `UserInfo` 扁平字段 + membershipStore
| 卡片 | 绑定 |
|------|------|
| 账号 | `username` / `displayName` / `phoneMasked` |
| 车辆 | `vehicle` / `plateMasked` / `vehicleColor` |
| 收货地址 | `receiver.name` / `receiver.phone` / `receiver.address` |
| 会员 | status：ACTIVE→COPY-033 / 否→「未开通」（实时） |

### P13 订单详情 `OrderDetail.tsx`（`/orders/:orderNo`）
| UI | 绑定（API-024 `Order` 快照） | 行为 |
|----|------------------------------|------|
| 返回 / 标题 | COPY-044 / COPY-043 | 返回→`/orders` |
| 头部卡 | orderNo / 状态(COPY-032\|033) / createdAt / `payMethod` | |
| 商品清单 | `lines[]` name/[color,capacity]/qty/`lineTotalCents` + 合计 | 快照，不随商品后续下架/改价变化 |
| 会员权益（会员） | `boundVehicle` / `validDays` | 二选一 |
| 收货信息（实物） | `receiver` name/phone/address | 二选一 |

### P14 搜索 `Search.tsx`（`/search?q=`）
> change（M-C）新增独立页；component-spec 此前缺失，按实现补入。
| UI | 绑定（API-005） | 行为 |
|----|----------------|------|
| 搜索输入 | 受控 `?q` | DRIVING→禁用 + 占位「行车中请用语音…」；OFFLINE→禁用 + 「网络不可用」；否则可输入 |
| mic | — | toast COPY-004 |
| 未输入态 | — | 提示「输入关键词搜索可购买商品（实物 / 会员）」 |
| 结果（2 列 bigcard） | `results[]`（名 substring，仅实物+会员、仅 published） | meta=有效期 N 天 \| 颜色；点击→详情；SOLD_OUT→COPY-046 |
| 空结果 | results=[] | COPY-014 + COPY-015（返回推荐→`/`） |

---

## 2. Admin 页面（apps/web/src/admin，路由 `/admin/*`）

| 页面 | 文件 | 主要区块 | 绑定 API |
|------|------|----------|----------|
| 登录 | `AdminLogin.tsx` | 登录表单（admin/123456） | API-020 |
| 布局 | `AdminLayout.tsx` | 左导航 CATALOG（商品/Banner/服务）· OPS（订单/会话）· ACCOUNT（账号信息）；内容区可滚动 | — |
| 商品 | `AdminProducts.tsx` | 商品表（含下架/售罄）+ 上下架 + 库存开关 + 「编辑/新增」`FormModal`（价格按元输入，提交转 priceCents） | API-021 / CRUD(0010) |
| Banner | `AdminBanners.tsx` | Banner 表 + 上下架 + 「编辑/新增」（targetProductCode 必须存在） | API-022 / CRUD |
| 服务 | `AdminServices.tsx` | 会员 + 展示服务分组 + 「编辑」（会员含价格/有效期/权益） | API-025 / CRUD |
| 订单 | `AdminOrders.tsx` | 订单表（全部，只读） | API-023 |
| 会话 | `AdminSession.tsx` | 运行快照：cartCount/cartSelected/checkoutCount/orderCount/membership/seq | API-026 |
| 账号信息 | `AdminAccount.tsx` | 个人 + 车辆只读（§10.4） | API-018 |
| 通用表单 | `FormModal.tsx` | 商品/Banner/服务新增·编辑共用弹窗；校验失败 4000 | — |

> Admin 写操作字段的必填/校验/可改性以 PRD §15.5 为准；删除走下架（不硬删，§15.14）；保存后前台下一次读取生效（§15.5.4）。
