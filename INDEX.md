# Apex Drive Store V2 — 文档索引

> 唯一导航入口。纯路由表，不含业务内容。项目总览看 [README.md](README.md)，规范看 [CONTRIBUTING.md](CONTRIBUTING.md)，启动护栏看 [CLAUDE.md](CLAUDE.md)。

## 当前状态
- 阶段：需求规格收口（Web-only）；PRD 已补到可开发执行规格（§15 模块/功能/业务流/数据流/Admin 字段/状态机/路由流转/边界用例）
- 上次会话：2026-05-29(S-016) PRD v1.1 大改后复核同步下游（CD-001..010）；新建 SPEC-005，REQ-001..042 全覆盖 SPEC-001..005（DRAFT）
- 当前阻塞：无 P0；仓库仍未 git init / 未脚手架应用代码；OpenSpec 仍为 DRAFT，待评审冻结后 APPROVED
- 下一步：按 PRD §15.13 的 S1→S7 薄片进入实现，或先继续补高保真原型缺页（P4/P5/P10/P11/P12/P13/Admin）

## 四个入口文件
| 文件 | 作用 |
|------|------|
| README.md | 项目总览 |
| INDEX.md | 文档导航（本文件） |
| CLAUDE.md | Agent 启动护栏 + 工程纪律 R5–R9 |
| CONTRIBUTING.md | 协作规范 |

## 仓库结构
```
Auto-MallTwo/
├── README.md                  项目总览
├── INDEX.md                   文档导航（本文件）+ 仓库结构
├── CLAUDE.md                  Agent 启动护栏 + 工程纪律 R5–R9
├── CONTRIBUTING.md            协作规范（目录/SSOT/PR）
├── CHANGELOG.md               变更日志（Keep a Changelog 1.1.0）
├── .pre-commit-config.yaml    R9.2 提交钩子脚手架（待启用）
│
├── apps/                      ★ 可交互实现（monorepo / npm workspaces）
│   ├── web/                   前台 / + Admin /admin（Vite+React+TS+Zustand），:5173
│   └── server/                Express + InMemoryStore（种子=§10），:3001/api
├── packages/
│   └── shared/                共享类型 / 错误码 / COPY 文案（SSOT 镜像）
├── product/
│   └── prd.md                 唯一 PRD（§10 数据契约★ / §11 文案★ 为 SSOT）
├── design/
│   ├── prototype/             高保真静态界面（ui.css + 19 页 P1–P13/A0–A5 + index）+ 线框蓝图 README
│   ├── benchmarking.md        车机商城调研与补充
│   ├── system-architecture.md 系统架构
│   ├── api-spec.md            接口清单 + 契约详例 + 数据模型
│   ├── component-spec.md      组件清单 + 字段绑定（P1-P13+Admin）
│   └── design-tokens.md       视觉 Token ★SSOT
├── engineering/
│   ├── tech-stack.md  dev-guide.md  build-variants.md  frontend-spec.md(状态/Store)
│   ├── frontend-files.md      前端文件汇总（apps/web 蓝图）
│   └── backend-files.md       后端文件汇总（apps/server 蓝图）
├── testing/
│   ├── test-strategy.md  test-cases.md  coverage-matrix.md
├── project/
│   ├── roadmap.md  issues.md  decisions.md(ADR)
├── sessions/
│   ├── _template.md  session-log.md
├── openspec/
│   ├── README.md              规格与变更提案说明 + REQ→SPEC 映射
│   ├── HANDOFF.md             仓库级跨 session 交接（R7）
│   ├── specs/                 DRAFT 规格（SPEC-001 购物 / 002 会员 / 003 演示控制 / 004 Admin+上下架 / 005 车载体验；评审冻结后转 APPROVED）
│   └── changes/_template.md   提案模板（active change 时各含 specs/ + HANDOFF.md）
└── docs/
    └── templates/HANDOFF.template.md   交接模板（R7）
```

## 快速导航
| 你要找的 | 去这里 |
|---------|--------|
| 产品需求（唯一 PRD：功能/故事/流程/页面/数据/文案/验收） | product/prd.md |
| 数据字面值（商品/用户/订单） ★SSOT | product/prd.md §10 |
| UI 文案 ★SSOT | product/prd.md §11 |
| 功能清单 | product/prd.md §4 |
| 业务流程 | product/prd.md §8 |
| 可执行规格（实现入口总览） | product/prd.md §15 |
| 模块地图与职责边界 | product/prd.md §15.1 |
| 业务流转表（页面→动作→API→数据） | product/prd.md §15.3 |
| 数据流转表（实体生命周期） | product/prd.md §15.4 |
| Admin 字段级规则 | product/prd.md §15.5 |
| 状态机 | product/prd.md §15.6 |
| 前台页面级交互详规 | product/prd.md §15.9 |
| 后端服务与接口行为细则 | product/prd.md §15.10 |
| 边界场景与异常口径 | product/prd.md §15.12 |
| 路由/页面流转/PendingAction | product/prd.md §15.15-15.16 |
| 开放问题与冻结条件 | product/prd.md §16 |
| 车机商城调研与补充 | design/benchmarking.md |
| 系统架构 | design/system-architecture.md |
| 接口清单 + 契约详例（请求/响应 JSON） | design/api-spec.md |
| 前端状态/Store 规格 | engineering/frontend-spec.md |
| 页面组件清单 + 字段绑定 | design/component-spec.md |
| 视觉 Token ★SSOT | design/design-tokens.md |
| 原型蓝图（线框） | design/prototype/README.md |
| 高保真界面（静态） | design/prototype/index.html（索引；前台 P1–P13 + 后台 A0–A5 共 19 页，共享 ui.css） |
| 可交互实现（运行/文件清单） | apps/web · apps/server（运行见 engineering/dev-guide §2；前端 frontend-files.md / 后端 backend-files.md） |
| 技术选型 | engineering/tech-stack.md |
| 开发指南 | engineering/dev-guide.md |
| 构建变体 | engineering/build-variants.md |
| 测试策略与范围 | testing/test-strategy.md |
| 测试用例 | testing/test-cases.md |
| 覆盖矩阵 | testing/coverage-matrix.md |
| 进度/Roadmap | project/roadmap.md |
| 问题跟踪 | project/issues.md |
| 决策记录（ADR） | project/decisions.md |
| 规格与变更提案流程 | openspec/README.md |
| 已批准规格（SPEC） | openspec/specs/ |
| 变更日志 | CHANGELOG.md |
| 工程纪律（R5–R9 / pre-commit gate） | CLAUDE.md §3 |
| 跨 session 交接（当前） | openspec/HANDOFF.md |
| 交接模板（R7） | docs/templates/HANDOFF.template.md |
| 提交钩子配置 | .pre-commit-config.yaml |
| 上一个会话的状态 | sessions/session-log.md |
| 会话交接模板 | sessions/_template.md |
