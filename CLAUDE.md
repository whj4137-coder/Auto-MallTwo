# CLAUDE.md — Apex Drive Store V2

> 每次启动**必读**。这是 Agent 的工作宪法：怎么思考、项目是什么、约束在哪、怎么交付。
> 导航看 [INDEX.md](INDEX.md)，需求看 [product/prd.md](product/prd.md)，协作细则看 [CONTRIBUTING.md](CONTRIBUTING.md)。本文件只放**决策时需要的**，不堆细节。

---

## 1. 第一性原理（最高优先级）

从原始需求和问题本质出发，不套惯例、不抄模板。这条优先级高于本文件其余所有内容。

1. **不要假设我已经想清楚了。** 我的动机或目标不清晰时，停下来跟我讨论，别自行脑补需求。
2. **目标清晰但路径不是最优**，直接说，并给出更好的方案——哪怕和我说的不一样。
3. **遇到问题追根因，不打补丁。** 每个决策都要能说清"为什么这么做"。
4. **输出说重点**，砍掉一切不影响决策的废话。

---

## 2. 项目背景

车机商城概念 Demo，运行于 Android 横屏 1280×720 dp / 横屏 PC 模拟环境，面向内部评审。演示四件事：驻车**低干扰购物闭环**、行车/断网**安全门禁**、实物/会员/展示服务**三类商品差异化**、前台/Admin/后端**三端联动**。
**不是**：不接真实支付、不对外发布、不承接真实订单、不是技术框架展示。

## 3. 核心架构

monorepo（npm workspaces），三端共享数据走同一后端：

- **apps/web** — Vite+React+TS+Zustand+Router。前台 `/`（P1–P13）+ Admin `/admin`（商品/Banner/服务/订单/会话/账号），复用 `src/styles/ui.css`。:5173
- **apps/server** — Express + InMemoryStore（无 DB，种子=PRD §10，可一键重置）。统一信封 `{code,message,data}`。:3001/api
- **packages/shared** — 类型 / 错误码 / COPY 文案，前后端唯一引用源（SSOT 镜像）。

**门禁双层**：前端 `lib/gate.ts` GateGuard（写入前判定 + 续作）＋ 后端中间件（鉴权 1001 / 行车 2001 / 断网 2002 / 展示服务越界 2003）。**金额、订单号、状态以后端为权威**，前端不定价、不改状态、不自造单号。

## 4. 关键目录

| 路径 | 是什么 |
|------|--------|
| `apps/web` / `apps/server` / `packages/shared` | 可交互实现（文件清单见 engineering/frontend-files.md、backend-files.md） |
| `product/prd.md` | **唯一需求**（§10 数据契约★ / §11 文案★ / §15 可执行规格） |
| `design/` | 架构 / 接口 api-spec / 视觉 design-tokens★ / 原型 prototype / 组件 component-spec |
| `engineering/` | tech-stack / dev-guide(运行) / frontend-files / backend-files |
| `testing/` | 策略 / 用例 / 覆盖矩阵 |
| `openspec/` | 变更提案（改 SSOT 必经）+ specs + HANDOFF |
| `project/` · `sessions/` | roadmap / issues / decisions(ADR) · 会话交接 |

## 5. 开发流程

1. 读本文件 → 需求查 [PRD](product/prd.md)（写实现重点看 **§15**）→ 接口查 [api-spec](design/api-spec.md)、架构查 [system-architecture](design/system-architecture.md)。
2. 接续进度看 [openspec/HANDOFF.md](openspec/HANDOFF.md) 与 [sessions/session-log.md](sessions/session-log.md)。
3. **分级铁律**（决定走哪条路，照 Rust RFC / K8s KEP）：
   - **小改**（bugfix 回归到既有规格 / 重构 / 纯补测试 / 文档 / 纯性能）→ 直接 PR/commit + 必要时登 [issues](project/issues.md)，**不需要提案**。
   - **大改**（改 商品/价格/文案/门禁/错误码/订单号/接口契约/布局形态 等任何 WHAT）→ **必须先有一份 `status: Accepted` 的 [openspec 提案](openspec/README.md)，再改 PRD/SSOT，再改代码与测试。**
4. **顺序不可逆**：大改的提案未到 `Accepted` 不得动业务代码；**禁止"先写代码再补提案"**。提案的 Test Plan（§6）是进入 `In Review` 的前置。实现与规格不符 → 要么开提案改，要么按 `W` 类登记 [issues](project/issues.md) 限期收口，**不得沉默漂移、不得借"对齐 PRD/派生文档"私自改行为**。

## 6. 运行 / 测试 / 提交

```bash
npm install
npm run dev:server   # 后端 http://localhost:3001/api（启动即 seed）
npm run dev:web      # 前台 :5173/ · 后台 :5173/admin（admin/123456）
npm run verify       # = typecheck（两端 tsc）+ check:ssot + test（Vitest L1/L2）
npm run test:e2e     # Playwright E2E（需服务在跑；不入 commit 门禁）
```
- **提交门禁（R5）**：commit 前 `npm run verify` 必过（typecheck + SSOT 字面值校验 + L1/L2 测试）；结果写进 commit body `Verified:` 段。**禁用 `--no-verify`**。`.claude/hooks/commit-gate.sh` 会在 `git commit` 时强制 verify（见 §10）。
- 测试分级（L1 Vitest / L2 Supertest / L3 Playwright）见 [testing/test-strategy.md](testing/test-strategy.md) §7（change 0009 已落地）。
- 提交信息：`[分区] 动词 + 对象`（详见 [CONTRIBUTING.md](CONTRIBUTING.md)）。仅在用户要求时才创建 commit/PR。

## 7. 编码规范

- TypeScript strict；命名语义化；**注释只写 WHY**（非显然的约束/坑），不写 WHAT。
- **金额一律 `priceCents`（分）整数**，仅渲染层 `/100`。
- **不硬编码业务字面值/文案**——全部从 `@apex/shared` 或后端 API 引用；`npm run check:ssot` 会扫码比对 §10/§11 镜像，发现重复即报错。
- 门禁只经 GateGuard / 后端中间件，组件**禁止**自行判断车速/网络/登录。

## 8. 关键口径（硬约束，违反即返工）

- **提案先于代码（机器守门）**：改 SSOT（`product/prd.md` / `design/design-tokens.md` / `packages/shared/src`）的提交，**必须引用一个 `status: Accepted` 的 openspec 提案**（commit message 写 change 号，或同提交纳入该 change 文件），否则 `.claude/hooks/commit-gate.sh` **闸门 A 阻断**。顺序不可逆、禁事后补提案（见 §5、change 0019 / ADR-0010）。
- **SSOT 锁定**：商品/价格/地址/车辆=PRD §10；UI 文案=PRD §11；视觉=design-tokens.md。代码禁止出现这三处之外的业务字面值。
- **门禁规则**：写入需 `LOGGED_IN AND PARKED AND ONLINE`；拦截优先级 `DRIVING > OFFLINE > GUEST`（同时命中只显最高）；登录/驾驶/网络仅 Demo Bar 手动切换，**绝不自动触发**。
- **三类商品**：实物=可加购可购买；会员=不进购物车、直接开通（全局单一、月/年卡互斥、幂等）；展示服务=只浏览，写入恒返 `2003`。
- **金额/订单号**：显示 `¥整数` 无小数，无运费/税/优惠；`ORDER-P/M-NNN` 两类独立递增，重置回 `001`。
- **视觉布局**：仅深色座舱（无明暗切换）、仅简体中文；Demo Bar 56dp + SideNav 112dp；主内容 1280×664 内免滚动（列表类例外）。
- **演示账号**：`admin` / `123456`（前台与 Admin 同账号）。

## 9. 注意事项 / 坑点（本环境实测）

- 沙箱禁 `os.getcwd()`，**python http.server 起不来**；预览用 `.claude/preview-server.js`（Node）。
- 本机 3000 端口被遗留进程占用，后端固定 **3001**（与 dev-guide 一致，无冲突）。
- `preview_click` 合成事件**不触发** React onClick；浏览器验证改用页内 `element.click()`。
- 未装 pnpm/corepack，用 **npm workspaces**（ADR-0004 偏差，I-016）。
- 仓库尚未 `git init` / `openspec init`，R5 的 openspec 步骤暂标 `Verified: openspec-not-initialized`（I-007）。

## 10. 强制校验（hook 驱动）

`.claude/settings.json` 注册 PreToolUse 钩子 → `.claude/hooks/commit-gate.sh`：拦截 `git commit`，两道闸门：
- **闸门 A（提案先行）**：改 SSOT（`product/prd.md` / `design/design-tokens.md` / `packages/shared/src`）的提交，必须引用一个 `status: Accepted` 的 openspec 提案（message 写 change 号，或同提交纳入该 change 文件），否则阻断（见 §5/§8、change 0019）。
- **闸门 B（R5 verify）**：跑 `npm run verify`（typecheck + SSOT 字面值校验 `scripts/check-ssot.mjs` + L1/L2），不过则阻断；带 `--no-verify` 直接拦。

这把 §5/§6 的纪律从"靠自觉"变成"git 拦着"。完整 R5–R9 工程纪律见 [CONTRIBUTING.md](CONTRIBUTING.md)。
