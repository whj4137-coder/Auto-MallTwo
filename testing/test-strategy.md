# 测试策略 — Apex Drive Store V2

> **这是什么**：测试方法与范围定义。核心要求：**不止主流程接口测试，必须覆盖完整业务流程的集成/E2E**（[../project/decisions.md](../project/decisions.md) ADR-0003）。
> 用例见 [test-cases.md](test-cases.md)，覆盖见 [coverage-matrix.md](coverage-matrix.md)。

## 1. 测试目标
1. 7+ 条完整业务流程端到端可跑通（A-01/A-02/B-01/C-01/AUTH-01/D-01/D-02/DEMO-01/SEARCH-01）。
2. 门禁矩阵（登录×驾驶×网络）逐格行为正确（REQ-024）。
3. 错误码 → 前端行为正确（REQ-025）。
4. **SSOT 一致性**：UI 文案/字面值/视觉与 PRD §11 / PRD §10 / design-tokens 一致（W 类偏差应被测出）。
5. 金额（分）、订单号（独立递增/重置）、不变量（A-02 购物车不变）正确。

## 2. 测试层次与范围

| 层 | 工具(推荐) | 覆盖 | 重点 |
|----|-----------|------|------|
| 单元测试 | Vitest | 纯逻辑：金额计算、订单号序列、门禁判定、SKU/数量校验 | 边界 [1,5]、分→元、优先级 |
| 接口/集成测试 | Supertest | 后端各接口入/出/错误码、门禁中间件、重置作用域 | 1001/2001/2002/2003/4000/4004/4009 |
| 端到端 E2E | Playwright（1280×720） | **完整业务流程**跨页面、续作、状态切换 | A-01…SEARCH-01 全流程 |
| Emulator | Android WebView/模拟器 | 车机承载冒烟：横屏、免滚动、WebView 加载 | 布局 1280×664 无滚动 |
| 一致性检查 | 脚本/快照 | 渲染文案/字面值比对 SSOT | W 类防漂移 |

## 3. 必测的完整业务流程（E2E）
每条从冷启动或重置态开始，断言到终态：
- **A-01** 实物购物车购买 → ORDER-P-001 已支付，购物车已勾选项被删。
- **A-02** 立即购买 → 新订单 ¥998；**断言购物车行数/数量/勾选不变**。
- **B-01** 会员开通 → ORDER-M-001 已开通 + membership ACTIVE + 详情按钮态切换 + 我的显示已开通。
- **C-01** 展示服务无购买入口 + 强制 POST /cart → 2003。
- **AUTH-01** 未登录拦截：错误密码提示保留、正确密码续作；覆盖 5 入口。
- **D-01** 行车拦截：置灰 + toast；确认/QR 页切行车主按钮置灰；切回恢复。
- **D-02** 断网拦截：置灰 + toast；可只读进购物车/订单。
- **DEMO-01** 重置：清空 + 复位 + 跳首页 + 下一单回 001。
- **SEARCH-01** 搜索：命中/空结果/行车断网禁用。

## 4. 门禁矩阵测试
按 REQ-024 表格逐格生成用例（操作 × 状态组合），断言：✅可用 / LoginDialog / 置灰+toast / 只读。优先级冲突用例：DRIVING+OFFLINE+GUEST 同时 → 只显示行车提示。

## 5. 通过标准（对齐 Phase 5 DoD）
- [ ] 全部 E2E 流程用例通过
- [ ] 门禁矩阵每格用例通过
- [ ] 错误码用例通过
- [ ] W 类（SSOT 偏差）= 0
- [ ] 1280×720 无意外滚动（Emulator 冒烟通过）
- [ ] 冷启动跑完一条完整购买 ≤ 10 分钟

## 6. 不测范围
真实支付、真实语音、真实网络波动、性能压测、明暗/多语言（均为排除项）。

## 7. 自动化测试落地（2026-05-29，change 0009）
三级套件已就位并全绿（命令见 [../engineering/dev-guide.md](../engineering/dev-guide.md) §2）：

| 级别 | 工具 | 文件 | 用例 | 覆盖 |
|------|------|------|------|------|
| L1 单测 | Vitest | `apps/server/src/store/sequencer.test.ts`、`services/shelf.test.ts`、`apps/web/src/lib/money.test.ts` | 7 | 订单号 P/M 递增·重置、上下架可见性·排序、分→¥ |
| L2 集成 | Supertest | `apps/server/src/api.test.ts` | 59 | 信封、home 聚合、门禁 1001/2001/2002/2003、**门禁优先级 DRIVING>OFFLINE>GUEST**、A-01 合并·结算·支付·收货字段·数量上限、B-01 互斥幂等、4009(DELISTED/SOLD_OUT/**ALREADY_PAID 重复支付**)、搜索(空 q→4000/命中/排除展示服务)、Demo 重置、Admin CRUD+校验(4000)、Admin 下架/改价→前台只读实时、门禁矩阵补充；**change 0013 补：登录 1002·登出失效·/me、订单详情命中+4004·/membership 状态机、目录 4004·类目排序、购物车删除·勾选·改量边界·4004、A-02 BUY_NOW 不变量、requireAdmin 拒绝 GUEST·admin/login·admin/session 快照·banner/service 上下架**；**change 0014 补 EDGE-001/002/004/005/012/014/016/017/020/024（§15.12 边界）**；**change 0015 EDGE-005 对齐：CART 改价后按新价结算 + 历史订单快照不变（I-029 已解）** |
| L3 E2E | Playwright(1280×720) | `e2e/shop.e2e.ts` | 10 | A-01、B-01、AUTH-01、D-01、A-02、C-01、D-02、SEARCH-01、LAYOUT-01（关键页无横向溢出，非列表页无整页纵向溢出）、**ADMIN-01（后台真实点击下架/上架 → 前台 UI 实时反映，真跨端联动）** |

- `npm run verify`（typecheck + check:ssot + **L1/L2，共 66**）已接入 commit-gate hook；L3（10）因需起服务+浏览器单独 `npm run test:e2e`。
- 隔离：L2 `beforeEach` 调 `store.resetAll()`；L3 每用例先点「重置数据」；ADMIN-01 改动 Admin 上下架后自带「上架」还原，避免污染共享内存态。
- 实跑（S-043，本机普通环境）：`verify` 66 + `test:e2e` 10 全绿，含 LAYOUT-01（1280×720 无溢出）与 ADMIN-01（跨端联动）；I-019 沙箱限制已解。

### 历史：手动冒烟记录（核心闭环首验）

| 用例 | 方式 | 结果 |
|------|------|------|
| 后端 A-01 实物：登录→加购→Checkout(CART)→支付→订单 | curl 脚本（:3001） | ✅ ORDER-P-001 PAID，金额 ¥129×2=25800 |
| 后端 B-01 会员：BUY_NOW mem_001→支付 | curl | ✅ ORDER-M-001，membership=ACTIVE |
| 门禁 GUEST/DRIVING/SCOPE 写入 | curl | ✅ 1001 / 2001 / 2003 文案对齐 §11 |
| 前端 A-01 全链路（浏览器 :5173） | Preview 浏览器 | ✅ 商品详情→加购(CART 1)→购物车¥129→确认→支付→「支付成功」ORDER-P |
| 前端 B-01 会员（浏览器） | Preview | ✅ 确认开通→「权益已开通」ORDER-M-001 ¥39 |
| GUEST 交易→LoginDialog；DemoBar 登录态切换 | Preview | ✅ 弹窗预填 admin/123456；切换即生效 |
| DRIVING 拦截 | Preview | ✅ 按钮置灰 + toast COPY-001，不发请求 |
| Admin 登录→商品管理（10 行）/订单管理 | Preview（:5173/admin） | ✅ 表格渲染、上下架/库存开关、订单查询 |

> 备注：`preview_click` 合成事件在本沙箱不触发 React onClick，验证改用页内 `element.click()`（等效真实点击）。下一迭代将这些用例固化为 Playwright E2E（L3）+ Supertest（L2）+ Vitest（L1）。
