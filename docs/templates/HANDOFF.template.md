# HANDOFF — <change-id 或「仓库级」>

> 跨 session 任务交接（R7）。**session 开始第一件事读它**；**session 结束 / 用户离开前更新下面三个固定栏位**。
> 有 active change 时放 `openspec/changes/<id>/HANDOFF.md`；无 active change（如初始化阶段）放 `openspec/HANDOFF.md`。

**更新时间**：YYYY-MM-DD HH:MM ｜ **会话**：S-NNN ｜ **active change**：<id 或 无>

## 1. 停在哪（Where we stopped）
- 最后改动文件 + 行号 + 一句话状态。
- 例：`engineering/dev-guide.md:42` 写到「GateGuard 续作逻辑」小节，已列要点未补示例。

## 2. 下次接（Next action）
- 粒度到「打开 X 文件改 Y 函数/小节」。
- 例：打开 `apps/server/src/cart.ts`，在 `addToCart()` 加 DISPLAY_SERVICE → 2003 分支。

## 3. Blocked / Open questions
- 当前阻塞 + 等待用户决策的问题（关联 I-NNN）。
- 例：I-005 技术栈未定（Web vs 原生），影响 pre-commit 命令。
