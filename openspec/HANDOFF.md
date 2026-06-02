# HANDOFF — 仓库级

> 已有多个 changes（0001–0010）。本文件维护仓库级总览；逐 change 细节见各 `changes/NNNN-*.md`。
> 模板见 [../docs/templates/HANDOFF.template.md](../docs/templates/HANDOFF.template.md)。

**更新时间**：2026-05-29 ｜ **会话**：S-031 ｜ **active changes**：0001–0011 全 **Accepted**；SPEC-001..005 **APPROVED**（已冻结）

## 1. 停在哪（Where we stopped）
- **可交互核心闭环已实现并联调通过**：monorepo（apps/web + apps/server + packages/shared，npm workspaces）。前台 P1–P13 + Admin 六模块（含新增「账号信息」只读）+ Express 后端 + 双层门禁 + Demo 重置。
- **实现已按能力切片走 openspec**：0002–0008 标 Accepted（已构建），0009（自动化测试）/0010（Admin CRUD）标 Draft（计划）。roadmap 与 openspec changes 索引 1:1 对齐。
- **工程门禁就位**：`npm run verify`（typecheck + check:ssot）+ commit-gate hook；SSOT 字面值 0 重复。
- 验证方式：手动 + curl/浏览器冒烟（testing §7）；自动化测试未写（I-017 / change 0009）。

## 2. 下次接（Next action）
> M-A 评审冻结已完成（2026-05-29，ADR-0009）；0009 测试、0010 Admin CRUD 已落地 Accepted。
1. **M-B 测试补全**：E2E 扩 A-02/C-01/D-02/SEARCH-01 + Admin 改→前台实时生效；门禁矩阵全格（REQ-024）。
2. **M-C 接口/文档收口**：api-spec 补 Admin 写操作(API-021/022/025) + Checkout 字段响应详例；搜索独立页（P2 重定向→真页）。
3. **M-F 验收**：演示脚本、1280×720 无滚动审计、P0/P1 清零、CHANGELOG 发版。

## 3. Blocked / Open questions
- 「后台打开有问题」：用户已确认**无问题**（关闭）。
- I-007：git init ✅（2 commits）；openspec init / pre-commit install 仍待。
- 车机 WebView（M-E）：本期不做（ADR-0009）。
- I-015（3000 端口遗留）/ I-016（pnpm 迁移）：低优先，待清理。
