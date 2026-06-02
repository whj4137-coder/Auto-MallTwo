# 开发指南 — Apex Drive Store V2

> **这是什么**：开发约定与本地运行/联调流程。技术栈见 [tech-stack.md](tech-stack.md)。
> **前置**：动手前先读 [../CLAUDE.md](../CLAUDE.md) 护栏 + [../INDEX.md](../INDEX.md)。

## 1. 黄金规则（与 SSOT 强一致）
1. **不硬编码业务字面值/文案**：商品/价格/地址来自 [../product/prd.md](../product/prd.md) §10，文案来自 [../product/prd.md](../product/prd.md) §11，颜色尺寸来自 [../design/design-tokens.md](../design/design-tokens.md)。
2. 把 SSOT 内容固化为代码常量/seed（建议 `packages/shared` 单源导出），其它模块只引用，不复制。
3. 金额一律 `priceCents`（分）整数运算，仅渲染层除 100。
4. 门禁统一走 GateGuard（前端）+ Gate 中间件（后端），不在各页面散写判断。
5. 改业务/契约/文案 → 先走 [../openspec/](../openspec/) 提案，再改 SSOT，再改码。偏差按 `W` 类登记 issues。

## 2. 本地运行（npm workspaces）

> 实现已落地为 monorepo：`apps/web`（前台 `/` + Admin `/admin`）、`apps/server`（Express）、`packages/shared`（类型/错误码/文案）。
> 注：ADR-0004 推荐 pnpm，但当前环境未装 pnpm，改用 **npm workspaces**（功能等价；偏差登记 issues I-016）。

```bash
npm install                 # 根目录一次装齐三个 workspace
npm run dev:server          # 后端 http://localhost:3001/api（内存数据，启动即 seed）
npm run dev:web             # 前台 http://localhost:5173/ ，Admin http://localhost:5173/admin
# Vite 已配 /api 代理 → :3001。浏览器置 1280×720 视口模拟车机横屏。
npm run verify              # 提交门禁：typecheck + check:ssot + test（Vitest L1/L2）
npm test                    # 仅 Vitest（L1 单测 + L2 Supertest 集成，18 例）
npm run test:e2e            # Playwright E2E（1280×720，需服务在跑；不入 commit 门禁）
```
> `npm run check:ssot` 以 `packages/shared/src/copy.ts`(§11) + `apps/server/src/store/seed.ts`(§10) 为镜像真值，扫码发现重复业务字面值即报错——逼你从 `@apex/shared` 或后端 API 取值，而非重抄。已接入 commit-gate hook。
> 测试套件 L1/L2/L3 见 [../testing/test-strategy.md](../testing/test-strategy.md) §7（change 0009）。

**分别用浏览器打开**：
- 前台： http://localhost:5173/
- 后台 Admin： http://localhost:5173/admin （演示账号 admin / 123456）
- 后端只读接口可直接看 JSON：如 http://localhost:3001/api/home 、 http://localhost:3001/api/health

## 3. 联调约定
- 统一响应信封 `{code,message,data}`；前端按 code 分发（见 REQ-025）。
- 写入请求带头：`Authorization`、`X-Demo-Drive`、`X-Demo-Net`（由 SessionState 注入）。
- 超时：连接 10s / 读 15s / 写 15s；超时/连接失败 → toast COPY-038。

## 4. 状态与门禁实现要点
- SessionState：`{ auth, drive, net }`，仅 Demo Bar 可改；TokenStore 内存；重启回 GUEST/PARKED/ONLINE。
- GateGuard：写入前判 `LOGGED_IN && PARKED && ONLINE`，否则按优先级 `DRIVING>OFFLINE>GUEST`：
  - DRIVING → toast COPY-001（不发请求）
  - OFFLINE → toast COPY-002（不发请求）
  - GUEST → 弹 LoginDialog，登录成功后**自动续作**原操作（保存 pending action）。
- 展示服务：前端无写入入口；后端对 DISPLAY_SERVICE 写入恒返 2003（支撑 C-01 强制调用）。

## 5. 编码规范
- TypeScript strict；ESLint + Prettier。
- 组件/文件命名语义化；提交信息 `[分区] 动词 + 对象`（见 [../CONTRIBUTING.md](../CONTRIBUTING.md)）。
- 每个可引用单元（接口/组件）注释关联 `REQ-NNN`，便于测试追溯（仅在 WHY 非显然处加注释）。

## 6. 提交前自检
- [ ] 无 SSOT 之外的字面值/文案
- [ ] 金额走分
- [ ] 写入受 GateGuard 保护
- [ ] 涉及的 REQ 验收项可手动走通
- [ ] 相关单测/集成/E2E 通过（见 [../testing/](../testing/)）
