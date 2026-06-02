# OpenSpec — 规格与变更提案区

> 规格驱动开发（spec-driven）。任何**业务规则、数据契约、文案、接口、门禁逻辑**的变更，先在这里提一份提案并达成共识，再动代码。

## 目录结构
```
openspec/
├── README.md              本文件：OpenSpec 是什么、怎么用
├── HANDOFF.md             仓库级跨 session 交接（R7，无 active change 时）
├── specs/                 当前 DRAFT 规格；评审冻结后转 APPROVED（锁定）
│   ├── SPEC-001-core-shopping-flow.md
│   ├── SPEC-002-membership.md
│   ├── SPEC-003-demo-controls.md
│   ├── SPEC-004-admin-and-shelf.md
│   └── SPEC-005-vehicle-experience.md
└── changes/               待审议的变更 proposal
    └── _template.md       proposal 模板（active change 各含 specs/ + HANDOFF.md）
```
> 说明：当前五份 SPEC 状态为 **DRAFT**，评审冻结后转 **APPROVED**（锁定）。`specs/` 当前承载候选稳定规格；`changes/` 是对规格/PRD 的变更提案。

## Spec 文件必含字段（模板）
每个 `specs/SPEC-NNN-*.md` 至少包含：
- 标题 + **状态**（APPROVED / DRAFT / REJECTED）+ 提出日期 + 批准日期 + 关联需求（REQ-NNN）
- **背景**（为什么做）
- **定义范围（做什么）**
- **明确排除（不做什么）**
- **验收标准**（可勾选）
- **变更历史**（表：日期 / 变更内容 / 原因）

## 变更提案索引（changes/）
> 实现按能力切片，逐片走 openspec。已构建=Accepted，计划=Draft。roadmap 与本表 1:1（见 [../project/roadmap.md](../project/roadmap.md)）。

| Change | 切片 | 状态 | 关联 SPEC |
|--------|------|------|-----------|
| 0001 | 首页改版（Bento+类目条+精选 rail+分类货架） | Accepted | SPEC-001 |
| 0002 | 实现脚手架 + 共享 SSOT 镜像 + 双层门禁基座 | Accepted | SPEC-001/003 |
| 0003 | 核心购物闭环 A-01/A-02 + 2003 + 4009 | Accepted | SPEC-001 |
| 0004 | 会员开通 B-01（互斥幂等） | Accepted | SPEC-002 |
| 0005 | 演示控制与门禁前端（DemoBar/GateGuard/重置） | Accepted | SPEC-003 |
| 0006 | Admin 六模块（含新增「账号信息」只读，扩展 SPEC-004） | Accepted | SPEC-004 |
| 0007 | Checkout 收货/配送后端权威字段（契约变更） | Accepted | SPEC-001 |
| 0008 | 工程门禁：SSOT 校验 + commit hook + verify | Accepted | 工程/ADR |
| 0009 | 自动化测试 L1/L2/L3（Vitest+Supertest+Playwright） | Accepted | 全部 |
| 0010 | Admin 完整 CRUD（新增·编辑表单） | Accepted | SPEC-004 |
| 0011 | 商品插画（代码生成 SVG）+ Product.image 字段 | Accepted | SPEC-001 |
| 0012 | 修复重复支付幂等 / 门禁优先级 / 搜索空查询（代码对齐冻结 PRD） | Accepted | SPEC-001/003 |
| 0013 | 补充自动化测试用例（覆盖空白端点 / 边界行为，纯补测试） | Accepted | 全部 |
| 0014 | EDGE-001..025 逐条 L2 落地（纯补测试；发现 I-029 重定价偏离） | Accepted | 全部 |
| 0015 | CART 结算按实时价（代码对齐 §15.12 EDGE-005，关 I-029） | Accepted | SPEC-001 |

> 评审冻结已完成（2026-05-29，S-031）：0001/0006/0007/0010/0011 全 Accepted、SPEC-001..005 APPROVED、§10/§11 硬锁。0012/0015 为冻结后的代码对齐修复（不改契约）。

## REQ → SPEC 覆盖映射
| SPEC | 覆盖 REQ |
|------|----------|
| SPEC-001 核心购物 | REQ-001/002/003/004/006/007/008/010/011/012/013/014/034/042 |
| SPEC-002 会员 | REQ-005/009/015/033 |
| SPEC-003 演示控制与门禁 | REQ-016/017/018/019/020/021/022/024/025/029/032 |
| SPEC-004 Admin 与上下架 | REQ-023/035/036/037/038/039/040/041 |
| SPEC-005 车载体验增强 | REQ-026/027/028/030/031 |

> 覆盖核对：REQ-001..042 已全部落入 SPEC-001..005（DRAFT）；冻结后转 APPROVED。


## 为什么需要它

本项目大量内容是**字面值锁定**的（商品、价格、文案、订单号规则、门禁矩阵）。直接改代码会导致代码与 [product/prd.md](../product/prd.md)（§10 数据契约 / §11 文案锁定）不一致。OpenSpec 强制「**先改约定，再改实现**」，保证唯一真值不漂移。

## 什么时候必须走提案

- 增删改商品 / 类目 / Banner / 用户 / 地址 / 车辆等任何字面值
- 修改任何 UI 文案
- 修改门禁规则、错误码、订单号或金额规则
- 新增 / 修改接口契约
- 调整页面布局形态或视觉 Token

## 什么时候不需要

- 纯实现重构（不改变 WHAT，不改变对外行为）
- 修 bug 让行为回归到已有约定（直接走 [issues.md](../project/issues.md)）

## 流程

1. 复制 [changes/_template.md](changes/_template.md) → `changes/NNNN-<短横线标题>.md`（编号递增）。
2. 填写：动机 / 变更内容 / 影响范围 / 验收。
3. 评审达成共识后，**先更新被影响的真值文档**（prd.md 的 §10/§11/需求清单 / design/api-spec / design/design-tokens）。
4. 再改代码与测试，使其与更新后的文档一致。
5. 提案状态置为 `Accepted`（或 `Rejected` / `Superseded`），归档保留。
6. 在 [../project/decisions.md](../project/decisions.md) 记录值得长期保留的决策（ADR）。

## 状态机

`Draft` → `In Review` → `Accepted` / `Rejected`　（被后续提案取代时标 `Superseded by NNNN`）

## 命名

- 文件：`changes/0001-lock-product-catalog.md`、`changes/0002-add-coupon-rule.md`
- 编号全局递增，不复用。
