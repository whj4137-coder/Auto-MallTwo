# 前端文件汇总 — Apex Drive Store V2（apps/web）

> **这是什么**：前台(前台 P1–P13)+ 后台(Admin /admin) 同一个 React/Vite 应用的**文件清单与职责**。实现按此蓝图。
> 栈见 [tech-stack.md](tech-stack.md)；状态契约见 [frontend-spec.md](frontend-spec.md)；组件字段绑定见 [../design/component-spec.md](../design/component-spec.md)；接口见 [../design/api-spec.md](../design/api-spec.md)；视觉见 [../design/design-tokens.md](../design/design-tokens.md)（CSS 落地 `src/styles/ui.css`，源自原型 `design/prototype/ui.css`）。
> 文案/字面值 SSOT：[../product/prd.md](../product/prd.md) §10/§11（前端不写死，统一从 `@apex/shared` 引用）。

## 运行
- 前台：`http://localhost:5173/`
- 后台：`http://localhost:5173/admin`
- 依赖后端 API：`http://localhost:3001/api`（Vite dev 代理 `/api` → 3001）

## 目录树
```
apps/web/
  index.html                      Vite 入口（挂载 #root，1280×720 device 容器）
  vite.config.ts                  React 插件 + /api 代理到 :3001
  tailwind.config.js  postcss.config.js
  tsconfig.json
  package.json
  src/
    main.tsx                      React 挂载 + Router
    App.tsx                       路由表（前台 / + 后台 /admin）
    styles/
      ui.css                      座舱设计系统（复用原型 ui.css）
      tailwind.css                @tailwind 指令
    lib/
      http.ts                     fetch 封装：统一信封解析、超时(连10/读15/写15)、注入 Authorization + X-Demo-Drive/Net 头
      api.ts                      各端点函数（home/catalog/product/auth/cart/checkout/pay/orders/membership/me/demo/admin*）对齐 API-001..026
      gate.ts                     门禁守卫：canWrite() / guardWrite(action) —— DRIVING>OFFLINE>GUEST，pending-action 续作
      money.ts                    yuan(priceCents)→¥整数；centsToYuanInput / yuanInputToCents（Admin 表单元↔分换算）
      paths.ts                    productPath(p)：按 type 生成 /product · /membership · /service 路由
      money.test.ts               L1 单测（分→¥）
    stores/                       Zustand（内存态）
      sessionStore.ts             auth/drive/net 三态（仅 DemoBar 切换）+ token
      cartStore.ts                购物车项/勾选/合计；add/remove/setQty/toggle/fetch
      membershipStore.ts          会员状态(ACTIVE/INACTIVE)；fetch
      adminStore.ts               Admin token + 各列表数据/操作
      uiStore.ts                  toast 队列(单条·优先级)、LoginDialog 开关、pendingAction
    components/
      DemoBar.tsx                 顶部 56dp：DEMO 徽标/品牌/驻车·行车/在线·断网/已登录·未登录/状态文字/重置数据
      SideNav.tsx                 左侧 112dp：首页/分类/购物车/订单/我的，当前路由高亮
      FrontLayout.tsx             前台外壳：DemoBar + SideNav + <main> + Toast + LoginDialog（1280×720 容器）
      Toast.tsx                   toast 渲染（COPY-001/002/005...）
      LoginDialog.tsx             P12 模态：预填 admin/123456，错误 COPY-003，成功续作
      ProductMedia.tsx            商品视觉：有 image 渲 <img>，否则回退类型图标（change 0011）
      icons.tsx                   Glyph 内置 SVG 图标集 + typeVisual(type)→图标/配色类
      gate/GatedButton.tsx        交易按钮：未满足门禁置灰/toast/弹登录（包裹 guardWrite）
    pages/                        前台 P1–P13 + 搜索页
      Home.tsx                    P1：Bento + 类目条 + 精选 rail + 分类货架（见 openspec 0001）
      Search.tsx                  /search：搜索结果（REQ-003 substring/仅实物+会员/门禁/空态 COPY-014·015）
      Category.tsx                P2：左类目 + 右商品网格
      ProductDetail.tsx           P3：实物详情 + Stepper + 立即购买/加入购物车
      Membership.tsx              P4：会员卡 + 权益 + 立即开通/已开通
      ServiceDetail.tsx           P5：展示服务（暂未开放，COPY-042）
      Cart.tsx                    P6：列表 + 摘要 + 前往结算
      Confirm.tsx                 P7：收货/商品/配送 + 去支付（标题实物/会员）
      Pay.tsx                     P8：金额 + 二维码占位 + 模拟扫码成功
      Result.tsx                  P9：成功 + 订单号 + 查看订单/返回首页
      Orders.tsx                  P10：订单卡列表（可进 P13）
      OrderDetail.tsx             P13：订单信息/商品清单/收货或权益 + 返回
      Mine.tsx                    P11：账号/车辆/地址/会员四卡
    admin/                        后台 /admin（六模块，change 0006/0010）
      AdminLayout.tsx             顶栏 + 左侧 anav（CATALOG/OPS/ACCOUNT）
      AdminLogin.tsx              A0：admin/123456
      AdminProducts.tsx           A1：商品列表 + 上下架/库存 + 新增·编辑（FormModal）
      AdminBanners.tsx            A2：Banner 列表 + 上下架 + 新增·编辑
      AdminServices.tsx           A3：会员/展示服务 + 上下架 + 编辑
      AdminOrders.tsx             A4：订单列表 + 类型筛选
      AdminSession.tsx            A5：演示会话运行快照 + 重置
      AdminAccount.tsx            账号信息：个人 + 车辆（只读，§10.4，change 0006）
      FormModal.tsx               通用编辑/新增表单弹窗（text/number/csv/select/checkbox）
```

## 核心闭环（本迭代必达）
- A-01 实物购物：P1→P3→加购(门禁)→P6→P7→P8→P9→P10。
- B-01 会员开通：P4→立即开通→P7(确认开通)→P8→P9→会员 ACTIVE（互斥幂等）。
- 门禁：GUEST→LoginDialog 续作；DRIVING→COPY-001 置灰；OFFLINE→COPY-002 置灰；优先级 DRIVING>OFFLINE>GUEST。
- 重置：DemoBar 重置数据 → 后端清会话 + 前端 store 复位 → 跳 P1。
- Admin：A0 登录 + A1 商品上下架/库存 + A4 订单查询；改动经后端，前台实时读。

## 不变量（前端纪律，见 architecture §3.2）
前端**不定价、不改订单状态、不自造订单号**；金额与状态以后端响应为权威。门禁只经 GateGuard，组件不自行判定车速/网络/登录。
