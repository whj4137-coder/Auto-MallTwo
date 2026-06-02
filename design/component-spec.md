# 组件清单与字段绑定 — Apex Drive Store V2

> **这是什么**：每个页面「由哪些组件构成、组件 props/本地态、API 字段 → UI 元素的绑定」，供前端直接拆组件、绑数据。
> **真值**：文案 PRD §11、字面值 PRD §10、视觉 [design-tokens.md](design-tokens.md)、交互 PRD §15.9、状态 [../engineering/frontend-spec.md](../engineering/frontend-spec.md)。
> **PRD 镜像**：摘要见 PRD §15.20；本文件为权威完整版。命名 PascalCase（CONTRIBUTING §3.1）。

---

## 0. 全局/通用组件（App Shell）

| 组件 | props | 本地态 | 数据来源 | 绑定/行为 |
|------|-------|--------|----------|-----------|
| `AppShell` | children | — | sessionStore | 组合 DemoBar + SideNav + 内容区 + ToastHost + LoginDialog |
| `DemoBar` | — | — | sessionStore.auth/drive/net | 三组 `Segmented`（驻车/行车·在线/断网·已登录/未登录）→ setDrive/setNet/setAuth；状态文案「{auth}·{drive}·{net}」(REQ-032)；「重置数据」→ API-019；自身不置灰 |
| `SideNav` | — | activeRoute | 路由 | 5 项 首页/分类/购物车/订单/我的；当前项高亮；购物车/订单 GUEST→openLogin |
| `ToastHost` | — | — | uiStore.toast | 单条、2.5s、按优先级覆盖（REQ-029）；文案取 §11 |
| `LoginDialog`(P12) | — | username,password,error | sessionStore | 预填 admin/123456；登录→API-006；1002→COPY-003；点外不关；成功 run(pending) |
| `PrimaryButton` | label,disabled,onClick | — | — | 高 64dp（design-tokens §7）；disabled=门禁/售罄 |
| `GhostButton` | label,disabled,onClick | — | — | 次按钮 |
| `Stepper` | value,min=1,max=5,onChange | — | — | 到 1「-」灰、到 5「+」灰（REQ-031） |
| `PriceText` | cents | — | — | 渲染 `¥{cents/100}` 整数（§10.6） |
| `StateBadge` | kind | — | — | 已支付/已开通/已售罄/暂未开放 标签 |
| `SkeletonBlock` | — | — | uiStore.skeleton | 首次加载骨架（REQ-030） |
| `EmptyState` | icon,text,actionLabel,onAction | — | — | 空态（COPY-012/013/014 + 按钮） |
| `ErrorRetry` | text,onRetry | — | — | 错误态可重试（COPY-036/037/038） |

---

## 1. 前台页面组件 × 字段绑定

### P1 首页（HomePage）
组件：`SearchBar`(含 VoicePlaceholder) / `HeroBanner` / `QuickCategoryGrid` / `FeaturedGrid` / `ServiceGrid`
| UI 元素 | 绑定（API-001 data） | 行为 |
|---------|----------------------|------|
| HeroBanner 标题/副标题/图 | home.banners[0].title/subtitle/assetKey | 点击→P3 `from=/home`（target=phy_car_001） |
| QuickCategoryGrid(5) | home.categories[].name/categoryCode | 点击→P2(categoryCode) |
| FeaturedGrid(≤3) | home.featured[]（published+homeFeatured） | 卡=assetKey/name/subtitle/PriceText(priceCents)/StateBadge(stock) |
| ServiceGrid(3) | home.services[]（§10.8） | 展示服务卡→P5；会员卡→P4 |
| SearchBar | 本地 searchDraft | PARKED+ONLINE 可输入；DRIVING 禁用+VoicePlaceholder(COPY-004)；OFFLINE 禁用 |

### P2 类目（CategoryPage）
组件：`CategoryFilter`(左) / `ProductGrid`(右) / `EmptyState`
| UI | 绑定 | 行为 |
|----|------|------|
| CategoryFilter | API-002 categories[]；本地 activeCategory | 点击→fetchCategoryProducts；当前高亮 |
| ProductGrid 卡 | API-003 product[]（published） | assetKey/name/subtitle/PriceText/StateBadge；PHYSICAL→P3、MEMBERSHIP→P4、DISPLAY_SERVICE→P5 |
| 空态 | product[]=[] | EmptyState「未查询到…」? 否→类目空态 + 返回推荐 |

### P3 实物详情（ProductDetailPage）
组件：`ProductGallery` / `SkuSelector`(颜色/容量) / `Stepper` / `DeliveryInfo` / `DetailActions`(PrimaryButton 立即购买 + GhostButton 加入购物车) / `BackButton`
| UI | 绑定（API-004） | 行为/本地态 |
|----|----------------|-------------|
| 标题/副标题 | name/subtitle | |
| PriceText | priceCents × qty | qty 改动实时；SKU 不改价 |
| SkuSelector 颜色 | colorSkus[]；本地 selectedColor=colorSkus[0] | |
| SkuSelector 容量 | capacitySkus[]（可空）；本地 selectedCapacity=capacitySkus?.[0] | |
| Stepper | 本地 qty=1，[1,5] | REQ-031 边界置灰 |
| DeliveryInfo | delivery.tag/note；stock | SOLD_OUT→StateBadge(已售罄) |
| 加入购物车 | — | guardWrite(ADD_CART)；售罄/下架 disabled |
| 立即购买 | — | guardWrite(BUY_NOW)→P7 |
| BackButton(COPY-044) | from | 回 from / 无则 P2 |

### P4 会员详情（MembershipDetailPage）
组件：`MemberCard`(渐变) / `BenefitList` / `BoundVehicleCard` / `DetailActions` / `BackButton`
| UI | 绑定 | 行为 |
|----|------|------|
| MemberCard | API-004 name/priceCents/membership | |
| BenefitList | membership.benefits[]/validDays | |
| BoundVehicleCard | membership.boundVehicle(特斯拉 Model Y) | |
| 主按钮 | membershipStore.status | INACTIVE→COPY-022 guardWrite(OPEN_MEMBERSHIP)→P7；ACTIVE→COPY-023→P10 |
| 售罄 | stock=SOLD_OUT | 主按钮置灰+COPY-046 |

### P5 展示服务详情（ServiceDetailPage）
组件：`ServiceHero` / `ServiceIntro` / `DisabledButton`(暂未开放) / `FooterNote` / `BackButton`
| UI | 绑定（API-004） | 行为 |
|----|----------------|------|
| 名称/介绍 | name/subtitle/detailText | |
| DisabledButton | display.buttonText(COPY-006) | 灰、点击仅提示、不发写入 |
| 说明 | display.note(COPY-007/008) | |
| FooterNote | COPY-042 | |

### P6 购物车（CartPage）
组件：`CartList`(`CartRow`×N) / `OrderSummary` / `EmptyState`
| UI | 绑定（API-008） | 行为 |
|----|----------------|------|
| CartRow 勾选/缩略图/名/SKU/小计 | items[].selected/assetKey/name/colorSku+capacitySku/unitPriceCents×quantity | toggleSelect(API-011) |
| CartRow Stepper | items[].quantity | setQuantity(API-010)；只读态禁用 |
| CartRow 删除 | — | removeItem(API-012) |
| OrderSummary | selectedTotalCents/地址/配送 | 合计实时；前往结算 COPY-025→guardWrite→API-013(CART) |
| 空态 | items=[] | COPY-012 + COPY-040 |
| 下架/售罄标 | items[].(published/stock 由刷新校验) | 结算 4009→COPY-045/046 |

### P7 确认订单（ConfirmPage）
组件：`AddressCard`(实物) / `OrderItemList` / `DeliveryNote`(实物) / `MemberBenefitCard`(会员) / `PaySummary`
| UI | 绑定（API-014 checkout） | 行为 |
|----|------------------------|------|
| 标题 | type | 实物 COPY-030 / 会员 COPY-031 |
| AddressCard | checkout.address（张先生/地址） | 只读 |
| OrderItemList | checkout.items[] | name/sku/qty/单价 |
| MemberBenefitCard | checkout（会员）+ membership | 绑定车辆/权益/有效期 |
| PaySummary | totalCents | 去支付 COPY-024→guardWrite→P8；失效 COPY-034 |

### P8 QR 支付（PayPage）
组件：`AmountDisplay` / `QrPlaceholder` / `PayNote` / `OrderBrief` / `PayActions`
| UI | 绑定（API-014） | 行为 |
|----|----------------|------|
| AmountDisplay | totalCents | 大字 |
| QrPlaceholder | — | 占位 |
| PayNote | COPY-009 | |
| OrderBrief | items/totalCents | |
| 模拟扫码成功 | — | COPY-010→guardWrite(PAY_CHECKOUT)→API-015→P9；防重复点击；失效 COPY-035/重复 4009 |
| 取消并返回 | COPY-011 | 回 P7，不删 checkout |

### P9 支付结果（ResultPage）
组件：`SuccessIcon` / `ResultTitle` / `OrderInfoRows` / `ResultActions`
| UI | 绑定（API-015/API-024 order） | 行为 |
|----|------------------------------|------|
| 标题 | type | 实物 COPY-028 / 会员 COPY-029 |
| OrderInfoRows | orderNo/totalCents/status(COPY-032/033) | |
| 查看订单/返回首页 | — | COPY-026→P10(highlight)；COPY-027→P1 |

### P10 订单中心（OrdersPage）
组件：`OrderCard`×N（内滚） / `EmptyState`
| UI | 绑定（API-016，时间降序） | 行为 |
|----|--------------------------|------|
| OrderCard | orderNo/缩略图/name/createdAt/totalCents/status | 点击→P13(orderNo,from=/orders) |
| 空态 | list=[] | COPY-013 + COPY-041 |

### P11 我的（MinePage）
组件：四张 `InfoCard`（账号/车辆/地址/会员）
| UI | 绑定（API-018/API-017） | 行为 |
|----|------------------------|------|
| 账号卡 | account（admin/车主用户/138****5678） | 只读 |
| 车辆卡 | vehicle（Model Y/沪A·****5/珍珠白） | 只读 |
| 地址卡 | address（张先生/地址） | 只读 |
| 会员卡 | membership.status | ACTIVE 已开通 / INACTIVE 未开通（实时） |

### P13 订单详情（OrderDetailPage）
组件：`OrderHeaderCard` / `OrderItemList` / `AddressCard`(实物) | `MemberBenefitCard`(会员) / `BackButton`
| UI | 绑定（API-024 order） | 行为 |
|----|----------------------|------|
| 标题 | COPY-043 | |
| OrderHeaderCard | orderNo/status/createdAt/支付方式 | |
| OrderItemList | items[]（快照） | sku/qty/单价 |
| AddressCard/MemberBenefitCard | order.address / order.membership | 实物 vs 会员二选一 |
| BackButton | COPY-044 | 回 P10 |

---

## 2. Admin 页面组件（/admin/*）
| 页面 | 主要组件 | 绑定 API |
|------|----------|----------|
| /admin/login | `AdminLoginForm` | API-020 |
| /admin/products | `ProductTable`(筛选 type/category/published/stock) + `ProductFormDrawer`(§15.5.1 字段) + `ShelfToggle` + `StockSelect` + `SortInput` | API-021 |
| /admin/banners | `BannerTable` + `BannerForm`(targetType/targetCode §15.5.2) + `ShelfToggle` | API-022 |
| /admin/services | `ServiceGroup`(会员/展示) + `ServiceForm`(§15.5.3) | API-025 |
| /admin/orders | `OrderTable`(筛选 type/status) + `OrderDetailView`(只读) | API-023 |
| /admin/session | `SessionPanel`(auth/drive/net/cartCount/checkout/orderCount/membership/seq) + `ResetButton`(可选) | API-026 |

> Admin 表单字段的必填/校验/可改性以 PRD §15.5 为准；保存后前台下一次读取生效（§15.5.4）。Admin 可滚动（§15.11.1）。
