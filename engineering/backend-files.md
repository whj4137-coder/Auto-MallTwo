# 后端文件汇总 — Apex Drive Store V2（apps/server）

> **这是什么**：Express + TypeScript Mock 服务的**文件清单与职责**。无 DB，进程内 InMemoryStore，一键重置。
> 接口契约 SSOT：[../design/api-spec.md](../design/api-spec.md)（API-001..026，统一信封 `{code,message,data}`）。
> 业务规则：[../product/prd.md](../product/prd.md) §10 数据 / §12 错误码 / §15 后端行为；架构见 [../design/system-architecture.md](../design/system-architecture.md)。

## 运行
- API 基址：`http://localhost:3000/api`
- 健康检查：`GET http://localhost:3000/api/health`
- 浏览器可直接打开只读接口（如 `/api/home`、`/api/categories`）查看 JSON。

## 目录树
```
apps/server/
  package.json                    dev: tsx watch src/index.ts
  tsconfig.json
  src/
    index.ts                      Express app：CORS + json + 信封中间件 + 路由挂载 + listen(3000)
    store/
      InMemoryStore.ts            进程内存：products/categories/banners/user/address/vehicle(种子) + cart/checkout/orders/membership(会话) + seqP/seqM/tokens
      seed.ts                     种子数据（PRD §10：10 商品/5 类目/3 Banner/用户·地址·车辆，published=true、stock=IN_STOCK）
      sequencer.ts                OrderSequencer：nextP()/nextM()/reset() → ORDER-P/M-NNN
    middleware/
      envelope.ts                 res.ok(data)/res.fail(code,message)；统一 {code,message,data}
      auth.ts                     校验 Bearer token；无效 → 1001
      gate.ts                     写入门禁：X-Demo-Drive=DRIVING→2001；X-Demo-Net=OFFLINE→2002；DISPLAY_SERVICE 写入→2003
    services/
      shelf.ts                    ShelfFilter：published 可见性；assertCheckoutable(校验下架/售罄 → 4009 reason)
      cart.ts                     同 SKU 合并、[1,5]、勾选合计
      checkout.ts                 由 CART/BUY_NOW 生成草稿并**重算金额**（后端权威定价）
      order.ts                    支付落单：写 Order 快照、删已勾选购物车项、会员置 ACTIVE
      membership.ts               全局单一、月/年卡互斥、幂等
    routes/
      home.ts                     API-001 GET /api/home（banner/类目/精选/货架，仅 published）
      catalog.ts                  API-002 /categories、API-003 /categories/:code/products、API-005 /search
      product.ts                  API-004 GET /products/:code
      auth.ts                     API-006 login、API-007 logout
      cart.ts                     API-008..012（含 DISPLAY_SERVICE→2003、售罄/下架校验）
      checkout.ts                 API-013 创建、API-014 查看
      pay.ts                      API-015 模拟支付（落单/删勾选/会员激活）
      orders.ts                   API-016 列表、API-024 GET /orders/:orderNo
      membership.ts               API-017 GET /membership
      me.ts                       API-018 GET /me
      demo.ts                     API-019 POST /demo/reset
      admin.ts                    API-020 login、API-021 products(GET/POST/PATCH + /shelf + /stock)、API-023 orders、(迭代二 API-022/025/026)
```

## 门禁与错误码（§12）
| 码 | 含义 | 触发 |
|----|------|------|
| 1001 | 未登录/无效 token | 写入接口缺有效 Bearer |
| 2001 | 行车拦截 | 写入头 `X-Demo-Drive=DRIVING` |
| 2002 | 断网拦截 | 写入头 `X-Demo-Net=OFFLINE` |
| 2003 | 范围超出 | 对 DISPLAY_SERVICE 调写入（如强制加购，支撑 C-01） |
| 4004 | 资源不存在 | 未知 productCode/orderNo/checkoutId |
| 4009 | 不可结算 | checkout 含 `published=false`(DELISTED) 或 `SOLD_OUT` |
| 5000 | 服务器异常 | 兜底 |

## 不变量（后端权威）
金额一律 `priceCents` 整数后端重算；订单号仅 OrderSequencer 分配；MEMBERSHIP 全局单一互斥幂等；Demo 重置仅清会话数据（cart/checkout/orders/membership + seqP/seqM 归零），**保留** Admin 对种子内容的编辑。

## packages/shared（前后端共享）
```
packages/shared/src/
  types.ts        Product/Category/Banner/Order/CartItem/Checkout/Membership/User... 
  enums.ts        ProductType/AuthState/DriveState/NetState/Source/Stock...
  errorCodes.ts   ERR.UNAUTHORIZED=1001 ... 与 §12 对齐
  copy.ts         COPY.* 文案常量（§11 字面值，前后端唯一引用源）
  index.ts        re-export
```
