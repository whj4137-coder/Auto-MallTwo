# 系统架构 — Apex Drive Store V2

> **这是什么**：三端（前台 / Admin / 后端）的结构、状态管理、数据层与门禁实现位置。HOW 的总览，细节实现见 [../engineering/](../engineering/)。
> 接口契约见 [api-spec.md](api-spec.md)，业务规则见 [../product/prd.md](../product/prd.md)。

---

## 1. 总体结构

```
┌────────────────────────────────────────────────────────────┐
│                  前台 App（Web-first / Android WebView 承载）    │
│  Demo Bar(状态机) │ SideNav │ 13 页面(P1–P13)                  │
│  ├─ UI 层（React + TypeScript + Vite）                         │
│  ├─ 状态层：SessionState(auth/drive/net) + TokenStore（内存）   │
│  ├─ 门禁前置层 GateGuard（写入前校验 LOGGED_IN·PARKED·ONLINE） │
│  └─ Repository（HTTP Client，超时 连10/读15/写15）             │
└───────────────┬────────────────────────────────────────────┘
                │ REST / JSON（统一信封 {code,message,data}）
                ▼
┌────────────────────────────────────────────────────────────┐
│                        后端（Mock Service）                    │
│  ├─ 路由/控制器：home/catalog/product/search/auth/cart/        │
│  │   checkout/pay/orders/membership/demo/admin                │
│  ├─ 门禁中间件 Gate：鉴权(1001) + 行车(2001) + 断网(2002)       │
│  │   + 范围(2003 展示服务写入)                                  │
│  ├─ 业务服务：Cart / Checkout / Order(序列号 P/M) / Membership │
│  └─ 内存数据存储 InMemoryStore（admin 用户维度）               │
└───────────────┬────────────────────────────────────────────┘
                │ 共享同一后端数据
                ▼
┌────────────────────────────────────────────────────────────┐
│              Admin 管理后台（六模块，含 CRUD+上下架）            │
│  login / products(CRUD) / banners(CRUD) / services /          │
│  orders(查询) / session(演示会话)  —— 改动经后端，前台实时读     │
└────────────────────────────────────────────────────────────┘
```

---

## 2. 状态管理

### 2.1 三组全局状态（前台，内存态）
| 状态 | 存储位置 | 切换方式 | 重启行为 |
|------|----------|----------|----------|
| auth GUEST/LOGGED_IN | SessionState + TokenStore | 仅 Demo Bar | 回 GUEST |
| drive PARKED/DRIVING | SessionState | 仅 Demo Bar | 回 PARKED |
| net ONLINE/OFFLINE | SessionState | 仅 Demo Bar | 回 ONLINE |

- 三组状态**不自动触发**，无传感器/网络监听，纯演示开关。
- 登录态仅内存（TokenStore），应用重启回 GUEST。
- `membership` 状态由后端持有（ACTIVE/INACTIVE），前台读取展示。

### 2.2 门禁实现位置（双层）
1. **前端 GateGuard（主）**：写入动作前校验 `LOGGED_IN AND PARKED AND ONLINE`，未满足按优先级 `DRIVING > OFFLINE > GUEST` 处理（置灰 / toast / 弹 LoginDialog）。**用户感知主要在这里**。
2. **后端 Gate（兜底+校验）**：
   - 无有效 token → 1001；
   - 请求头标注 `X-Demo-Drive=DRIVING` 的写入 → 2001；`X-Demo-Net=OFFLINE` 的写入 → 2002；
   - 展示服务（DISPLAY_SERVICE）写入 → 2003（即使前端无入口，强制调用也被拦，支撑 C-01）。

> 前端把当前 drive/net 通过请求头传后端，使后端可独立返回 2001/2002，便于测试与 C-01 强制调用验证。

---

## 3. 数据层

- **InMemoryStore**：进程内存储，键以 admin 用户维度组织。**数据为后端种子/初始化数据，前端不写死**。
- **种子数据**：启动载入 PRD §10 的 10 商品 / 5 类目 / 3 Banner / Mock 用户·地址·车辆，含 `published`/`sortOrder` 字段（默认全部上架）。
- **内容数据（Admin 可改）**：商品/Banner/服务的字段与上下架状态 → 由 Admin API 修改并持久化于 store，**前台只读接口实时读取**（前台只返回 `published=true`）。Demo 重置**不**还原内容编辑（仅重置演示会话数据）。
- **演示会话数据（可变，被 Demo 重置清空）**：cart / checkout / orders / membership。
- **订单号序列**：`seqP`、`seqM` 两个计数器，独立递增，重置归零。
- **金额**：一律 `priceCents`（分）整数运算，渲染层除 100 显示。
- **下架结算校验**：创建 checkout（CART）时校验所含商品 `published`，含下架项 → 4009（前端 COPY-045）；历史订单不受影响。

### 3.1 Demo 重置作用域
| 数据 | 重置后 |
|------|--------|
| cart / checkout / orders / membership | 清空 |
| seqP / seqM | 归 0（下一单 001） |
| 种子数据（商品/类目/Banner/用户） | 保留 |
| 前台 SessionState + TokenStore | GUEST + PARKED + ONLINE |
| 路由 | 跳回首页 |

---

## 3.2 模块间流程合约（避免越界）
- **门禁单点**：所有写入只经 GateGuard（前端）+ Gate 中间件（后端），任何组件**禁止自行判断**车速/网络/登录。
- **Cart → Checkout**：结算时由后端生成 checkout 草稿并**重新计算金额**（禁止前端定价/改价）；BUY_NOW 不触碰购物车。
- **Checkout → Pay → Order**：仅「模拟扫码成功」(API-015) 处写订单并置状态；**前端禁止直接修改订单状态**。CART 来源支付后删已勾选项；MEMBERSHIP 置 ACTIVE（互斥幂等）。
- **上下架**：创建 checkout 校验 `published`，含下架项 → 4009（COPY-045）；历史订单快照不受影响。
- **订单号**：仅 OrderSequencer 分配 ORDER-P/M-NNN（独立递增，重置归零），其它模块不自造单号。

## 3.3 深模块（复杂内部 / 简单稳定接口 / 可独立测试）
| 深模块 | 对外接口（要点） | 内部封装 |
|--------|------------------|----------|
| GateGuard | `canWrite()` / `guard(action)` | 三态判定 + 优先级 DRIVING>OFFLINE>GUEST + pending-action 续作 |
| CartStore | add/remove/setQty/toggle/checkout | 同 SKU 合并、[1,5] 约束、勾选合计 |
| OrderSequencer | nextP() / nextM() / reset() | seqP/seqM 独立递增、重置归零 |
| MembershipState | activate(productCode) / status() | 全局单一、月/年卡互斥、幂等 |
| ShelfFilter | visible(item) / assertCheckoutable(cart) | published 可见性 + 结算下架拦截 |

## 3.4 页面与路由范围

- 前台页面以 PRD §9.3 / §15.15 为准：P1 首页、P2 类目、P3 实物详情、P4 会员详情、P5 展示服务详情、P6 购物车、P7 确认订单、P8 QR 支付、P9 支付结果、P10 订单中心、P11 我的、P12 LoginDialog、P13 订单详情，**+ `/search` 搜索页（change 0001/M-C）**。
- v1 主线为 **React/Vite Web**，车机侧以 Android WebView 承载同一构建产物；不做原生 Compose 实现。
- 页面路由、参数、返回规则、PendingAction 续作以 PRD §15.15-§15.17 为准。

---

## 4. 关键时序

### 4.1 加购（含未登录续作）
```
用户点「加入购物车」
  → GateGuard 校验
     ├─ GUEST：弹 LoginDialog → 登录成功(POST /auth/login) → 自动续作原加购
     ├─ DRIVING：toast COPY-001（不发请求）
     ├─ OFFLINE：toast COPY-002（不发请求）
     └─ 通过：POST /cart → 200 → toast COPY-005「已加入购物车」
```

### 4.2 下单支付（实物购物车 / 立即购买 / 会员，统一）
```
确认页 → POST /checkout {source: CART|BUY_NOW, items|productCode+sku+qty}
       → GET /checkout/{id}（金额明细）
QR 页  → POST /checkout/{id}/pay（模拟扫码成功）
       → 后端：生成订单(ORDER-P/M-NNN)；CART 来源删除已勾选购物车项；
              会员来源置 membership=ACTIVE
       → 支付结果页（标题按类型）→ 订单中心
```

### 4.3 展示服务强制写入（C-01）
```
P5 仅有「暂未开放」按钮（前端无写入入口）
强制 POST /cart {productCode: svc_charge_001}
  → 后端 Gate 识别 DISPLAY_SERVICE → 返回 2003 → toast COPY-039
```

### 4.4 会员开通（B-01）
```
P4 点「立即开通」→ GateGuard 通过
  → POST /checkout {source:BUY_NOW,type:MEMBERSHIP,productCode:mem_001}
  → P7 确认开通 → P8 → POST /checkout/{id}/pay
  → 后端：seqM+1 生成 ORDER-M-001；Membership=ACTIVE(记 orderNo/validDays/boundVehicle)
  → 前端：orderStore 写入；membershipStore.fetch() → P9「权益已开通」
  → 回 P4：两张会员卡按钮均 COPY-023（幂等，再开通不产生新单）
```

### 4.5 上下架 / 售罄 结算拦截（REQ-035/042）
```
Admin PATCH /admin/products/{code}/shelf {published:false}（或 stock:SOLD_OUT）→ 持久化 store
前台下一次读取：catalog 只读接口不返回下架项（售罄项仍返回带 stock=SOLD_OUT）
购物车已有该商品：P6 仍显示
  → 前往结算 POST /checkout
  → 后端校验 published/stock → 4009 {reason:"DELISTED"|"SOLD_OUT"}
  → 前端 toast COPY-045 / COPY-046；历史订单快照不受影响
```

### 4.6 Demo 重置（DEMO-01）
```
Demo Bar 点「重置数据」→ POST /demo/reset
  → 后端清 cart/checkout/orders/membership；seqP/seqM=0；保留 Admin 内容编辑
  → 前端清 TokenStore+session；各 store 复位；跳 P1（GUEST+PARKED+ONLINE）
```

### 4.7 前↔后端 读/写 职责速查
| 功能 | 前端写动作 | 后端权威处理 | 前端读刷新 |
|------|-----------|--------------|-----------|
| 加购 | guardWrite→API-009 | 合并 SKU / 校验 published·stock·type | cartStore |
| 改量/勾选/删除 | API-010/011/012 | 数量边界 / selected / 删除 | cartStore.selectedTotalCents |
| 结算 | API-013 | 重算金额 / 校验下架售罄 | checkoutStore |
| 支付 | API-015 | 生成订单号 / 写 Order 快照 / 删勾选项 / 置会员 ACTIVE | orderStore+cartStore+membershipStore |
| 会员开通 | API-013(MEM)+API-015 | 全局单一互斥幂等 | membershipStore |
| Admin 内容 | API-021/022/025 | 持久化 + 字段校验(§15.5) | 前台下次读取生效 |
| 重置 | API-019 | 清会话数据 / seq 归零 | 全 store 复位 |

> 不变量：前端不定价、不改订单状态、不自造订单号；金额与状态以后端为权威（PRD §3.2/§15.10）。

---

## 5. 错误与超时
- 统一响应信封：`{ "code": <int>, "message": <string>, "data": <any> }`。
- 错误码→前端行为见 REQ-025；超时 连接 10s / 读 15s / 写 15s。
- 网络层失败（OFFLINE 仍发出的请求 / 超时）→ toast COPY-038。

---

## 6. 部署形态（Demo）
- 后端：单进程 Mock 服务（语言/框架见 tech-stack），内存存储，无 DB。
- 前台 + Admin：同后端联调；PC 横屏模拟 = 1280×720 视口。
- 无真实支付网关、无真实语音、无外部依赖。

### 6.1 实现落地（2026-05-29）
- monorepo（npm workspaces）：`apps/web`（Vite/React，前台 `/` + Admin `/admin`）、`apps/server`（Express + InMemoryStore，:3001）、`packages/shared`（类型/错误码/文案 SSOT 镜像）。
- 文件清单：前端见 [../engineering/frontend-files.md](../engineering/frontend-files.md)，后端见 [../engineering/backend-files.md](../engineering/backend-files.md)。
- 门禁双层已实现：前端 `lib/gate.ts` GateGuard + 后端 `middleware/gate.ts`（2001/2002）、`middleware/auth.ts`（1001）、DISPLAY_SERVICE 写入 2003。
- 本迭代为**核心闭环**（A-01 实物 / B-01 会员 / 门禁 / 重置 / Admin 商品·订单）；路由合并实现：后端 `routes/{catalog,auth,cart,checkout,orders,demo,admin}.ts`（较文件蓝图做了合并，职责不变）。
