# CONTRIBUTING — 协作规范

> 文档怎么写、目录怎么放、变更怎么走。**结构与规范的唯一真值在本文件**（不放进 INDEX.md，也不放进 CLAUDE.md）。
> 导航去 [INDEX.md](INDEX.md)，背景与护栏去 [CLAUDE.md](CLAUDE.md)。

---

## 1. 目录结构与职责分区

```
apex-drive-store-v2/
├── INDEX.md                    ← 唯一导航入口（纯路由表，不含业务内容）
├── CONTRIBUTING.md             ← 本文件：协作规范
├── CLAUDE.md                   ← Agent 启动必读：背景 + 硬约束护栏（不含结构信息）
│
├── product/                    ← 业务需求区（WHAT，不写 HOW）
│   └── prd.md                  ← 唯一 PRD（功能/故事/流程/页面 + §10 数据契约★SSOT + §11 文案锁定★SSOT）
│
├── design/                     ← 设计输出区
│   ├── prototype/              ← 原型文件（前台 + Admin）
│   ├── system-architecture.md  ← 系统架构 + 功能数据流转
│   ├── api-spec.md             ← 接口清单 + 契约详例 + 数据模型
│   ├── component-spec.md       ← 组件清单 + 字段绑定
│   └── design-tokens.md        ← 视觉 Token ★SSOT
│
├── engineering/                ← 工程实施区（HOW，不写 WHAT）
│   ├── tech-stack.md
│   ├── dev-guide.md
│   ├── build-variants.md
│   └── frontend-spec.md        ← 前端状态/Store/门禁/API 客户端规格
│
├── testing/                    ← 测试区
│   ├── test-strategy.md        ← 测试方法与范围定义
│   ├── test-cases.md           ← 测试用例
│   └── coverage-matrix.md      ← 覆盖矩阵（单测/集成/E2E/Emulator）
│
├── project/                    ← 项目管理区
│   ├── roadmap.md              ← 开发计划表（Phase 0/1/2…）
│   ├── issues.md               ← 问题跟踪表
│   └── decisions.md            ← 决策记录（ADR 格式）
│
└── sessions/                   ← 会话交接区
    ├── _template.md            ← 交接模板
    └── session-log.md          ← 会话进度日志
```

**分区边界铁律**
- `product/` 只写 **WHAT**（业务意图、验收），禁止写技术实现。
- `engineering/` 只写 **HOW**，禁止重定义业务规则（业务以 `product/` 为准）。
- 变更传导方向固定：`product/ → design/ → engineering/ → testing/`。

---

## 2. SSOT（单一真值源）规则

标 ★SSOT 的文档是字面值/文案/视觉的**唯一真值**：
- `product/prd.md §10 数据契约`：商品、类目、Banner、用户、地址、车辆、订单号、金额规则
- `product/prd.md §11 文案锁定`：所有 UI 文案
- `design/design-tokens.md`：颜色、间距、圆角、字号

**铁律**：代码中**禁止**出现 SSOT 之外的业务字面值/文案。任何偏差按问题类型 `W`（SSOT 偏差）登记进 [project/issues.md](project/issues.md)。
**改 SSOT 必须先走变更提案**（见 [openspec/README.md](openspec/README.md)）：先改文档，再改代码与测试。

---

## 3. 文档写作规范

- **语言**：简体中文。
- **每份文档开头**：一句话说明「这份文档是什么 / 谁来读 / 唯一真值是不是它」。
- **可被引用的条目必须有 ID**：需求 `REQ-NNN`、用户故事 `US-NNN`、测试用例 `TC-NNN`、接口 `API-NNN`、决策 `ADR-NNNN`、问题 `I-NNN`、会话 `S-NNN`、变更提案 `openspec/changes/NNNN-*`。
- **交叉引用**用相对路径链接，禁止「见上文/见那个文档」式模糊指代。
- **状态标记**统一用：✅ 完成 / 🟡 进行中 / ⬜ 未开始 / ⏸ 暂停 / ❌ 失败。
- 新增任何文档，必须同步在 [INDEX.md](INDEX.md) 路由表登记。

### 3.1 代码命名约定
- **文件夹 / 文件名**：kebab-case（如 `driving-context/`、`order-card.tsx`）。
- **TS 类型 / 接口 / 组件**：PascalCase（如 `Product`、`OrderCard`）。
- **函数 / 变量**：camelCase；**常量**：UPPER_SNAKE_CASE。
- **CSS 变量 / token**：沿用 design-tokens 命名（kebab，如 `--brand`）。
- **测试文件**：与被测同目录，命名 `*.test.ts` / `*.spec.ts`。
- **包名前缀**（如启用 monorepo）：`@ads/`（如 `@ads/web`、`@ads/server`、`@ads/shared`）。
- 金额变量统一以 `Cents` 结尾（如 `priceCents`、`totalCents`），仅渲染层除 100。

---

## 4. 变更 / PR 规范

1. **改前先读**：CLAUDE.md → INDEX.md → 对应分区文档。
2. **业务/契约/文案/接口/视觉变更**：先在 `openspec/changes/` 提案 → 评审 → 改 SSOT → 改代码/测试。
3. **每个 PR 单一目的**，标题格式：`[分区] 动词 + 对象`，如 `[product] 锁定商品契约 (REQ-001..010)`。
4. **PR 描述必须包含**：动机、影响的文档/SSOT、关联 `I-NNN` / `openspec NNNN`、验收方式。
5. **代码改动**：若触及 SSOT 字面值/文案，PR 里必须贴出对应 SSOT 文档的同步链接，否则不予合并。
6. **提交前强制校验（R5）**：commit 前跑通 `openspec validate --strict` +（代码）lint+unit test，输出附 `Verified:` 段；失败禁 commit，禁 `--no-verify`。详见 [CLAUDE.md](CLAUDE.md) §3。
7. **归档同步变更日志（R8）**：change 归档时在 [CHANGELOG.md](CHANGELOG.md) `[Unreleased]` 加一行。
8. **每次会话结束**：先更新 HANDOFF（R7），再按 [sessions/_template.md](sessions/_template.md) 写交接，遗留转入 issues.md，并在 [sessions/session-log.md](sessions/session-log.md) 追加一行。

---

## 5. 问题与决策

- **问题**（BUG/SPEC/DEBT/LAYOUT/W）→ [project/issues.md](project/issues.md)，编号 `I-NNN`。
- **决策**（值得长期保留的技术/产品取舍）→ [project/decisions.md](project/decisions.md)，ADR 格式，编号 `ADR-NNNN`。
- 会话交接中的遗留项**必须**转入 issues.md 才算闭环。

## 6. 工程纪律（R5–R9）

强制纪律的**权威定义在 [CLAUDE.md](CLAUDE.md) §3**（ADR-0006）：R5 提交前校验 / R6 双评审 / R7 跨 session HANDOFF / R8 Change Log 同步 / R9 Scenario-First + Step Hooks + 测试四级。本节仅指引，细则以 CLAUDE.md 为准。
