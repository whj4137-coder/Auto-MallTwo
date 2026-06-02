# Apex Drive Store V2

> 车机商城概念 Demo —— 运行于 Android 横屏 1280×720 dp / 横屏 PC 模拟环境，面向内部评审演示。

## 这是什么
向评审展示四件事：驻车场景**低干扰购物闭环**（5–10 分钟跑完）、行车/断网**安全门禁**、实物/会员/展示服务**三类商品差异化**、前台/Admin/后端**三端联动**。
不接真实支付、不对外发布、不承接真实订单。完整定义见 [产品需求文档 PRD](product/prd.md)。

## 当前状态
文档（治理/需求/设计/工程/测试）就位 + **可交互核心闭环已实现并联调通过**：前台 P1–P13 + Admin 六模块 + Express 后端。下一步补自动化测试与剩余 Admin 编辑能力。进度见 [project/roadmap.md](project/roadmap.md)，遗留见 [project/issues.md](project/issues.md)。

## 如何运行
```bash
npm install
npm run dev:server   # 后端 http://localhost:3001/api
npm run dev:web      # 前台 http://localhost:5173/ · 后台 http://localhost:5173/admin（admin/123456）
```
细节见 [engineering/dev-guide.md](engineering/dev-guide.md)。

## 文档怎么看（四个入口文件）
| 文件 | 作用 | 谁读 |
|------|------|------|
| **[README.md](README.md)** | 项目总览（本文件） | 所有人，第一眼 |
| **[INDEX.md](INDEX.md)** | 唯一文档导航路由表 | 找任何文档从这里 |
| **[CLAUDE.md](CLAUDE.md)** | Agent 启动必读：背景 + 硬约束护栏 | AI / 开发 |
| **[CONTRIBUTING.md](CONTRIBUTING.md)** | 协作规范：目录/SSOT/PR 规则 | 贡献者 |

> 需求只有一份：**[product/prd.md](product/prd.md)**（含功能清单、数据契约 §10、文案锁定 §11，均为 SSOT）。

## 目录结构
```
apps/web      前台 / + Admin /admin（Vite+React）         apps/server   Express + 内存存储
packages/shared  共享类型 / 错误码 / 文案（SSOT 镜像）
product/      业务需求（唯一 PRD）                          design/       架构 / 接口 / 视觉 token / 原型 / 组件
engineering/  技术栈 / 开发指南 / 前后端文件清单            testing/      策略 / 用例 / 覆盖矩阵
project/      roadmap / issues / decisions                  sessions/     会话交接      openspec/  变更提案
```

## 核心约束（详见 PRD / CLAUDE）
- 写入门禁：`LOGGED_IN AND PARKED AND ONLINE`，优先级 `DRIVING > OFFLINE > GUEST`。
- 字面值与文案以 PRD §10/§11 为唯一真值；视觉以 [design/design-tokens.md](design/design-tokens.md) 为准。
- 金额以「分」存储；订单号 `ORDER-P/M-NNN` 独立递增、重置归零。
- 演示账号 `admin` / `123456`。

## 如何协作
改业务/契约/文案 → 先走 [openspec 提案](openspec/README.md) → 改 PRD → 改代码与测试。详见 [CONTRIBUTING.md](CONTRIBUTING.md)。
