# HANDOFF — 仓库级

> 已有多个 changes（0001–0010）。本文件维护仓库级总览；逐 change 细节见各 `changes/NNNN-*.md`。
> 模板见 [../docs/templates/HANDOFF.template.md](../docs/templates/HANDOFF.template.md)。

**更新时间**：2026-05-29 ｜ **会话**：S-022 ｜ **active changes**：0001/0006/0007 待评审；0009/0010 计划中

## 1. 停在哪（Where we stopped）
- **可交互核心闭环已实现并联调通过**：monorepo（apps/web + apps/server + packages/shared，npm workspaces）。前台 P1–P13 + Admin 六模块（含新增「账号信息」只读）+ Express 后端 + 双层门禁 + Demo 重置。
- **实现已按能力切片走 openspec**：0002–0008 标 Accepted（已构建），0009（自动化测试）/0010（Admin CRUD）标 Draft（计划）。roadmap 与 openspec changes 索引 1:1 对齐。
- **工程门禁就位**：`npm run verify`（typecheck + check:ssot）+ commit-gate hook；SSOT 字面值 0 重复。
- 验证方式：手动 + curl/浏览器冒烟（testing §7）；自动化测试未写（I-017 / change 0009）。

## 2. 下次接（Next action）
1. **评审冻结**：0001（首页 vs §10.8）、0006（Admin 账号信息纳入 SPEC-004）、0007（api-spec 补响应字段示例）；冻结后 SPEC-001..005 转 APPROVED。
2. **change 0009**：装 Vitest/Supertest/Playwright，按 testing/test-cases 写 L1/L2/L3，并入 verify + hook。
3. **change 0010**：Admin 商品/Banner/服务 完整 CRUD（新增·编辑表单 + 后端写校验）。

## 3. Blocked / Open questions
- 用户报「后台打开有问题」具体现象待确认（我侧 :5173/admin 全 6 页正常）。
- I-007：git init / openspec init / pre-commit 启用仍待。
- PRD §15.14 待确认：Admin 删除策略 / 图片来源 / 表单形态 / 搜索路由 / 详情实时刷新。
- SPEC-001..005 仍 DRAFT，待评审冻结（OQ-005）。
