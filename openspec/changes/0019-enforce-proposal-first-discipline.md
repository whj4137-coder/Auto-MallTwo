---
id: 0019
title: 工程纪律强化：提案先行闸门 + 分级规则 + 模板升级
status: Accepted
author: Claude
created: 2026-06-03
updated: 2026-06-03
related_milestone: M5
related_issues: []
---

# 0019 · 工程纪律强化：提案先行闸门 + 分级规则 + 模板升级
> 注：原拟编号 0018，因并发会话已占用 0018（PRD §15.9 对齐），本 change 改用 0019（编号不复用）。

## 1. 动机（Why）
对照权威开源项目（Rust RFC / React RFC / Kubernetes KEP / Python PEP / ADR）的立项与规格驱动范式，复盘出本项目 openspec 落地的系统性偏差：

- **流程倒置**：changes 0002–0011 标 `author: Claude (impl)` + "已完成"，是**先写代码再补提案**——提案沦为事后记录，丧失"动代码许可证"的闸门作用。
- **闸门是空的**：`commit-gate` 只跑 verify，不校验"改 SSOT 的提交是否引用了 Accepted 提案"，代码先行在机器层面畅通无阻。
- **状态机空转**：所有 change 直接 `Accepted`，从无 `In Review`，无评审期。
- **"对齐 PRD"成逃逸出口**：真实行为变更被框成"代码对齐 PRD（不改契约）"绕过重流程，边界未画清。
- **分级缺失**：没有"小改走 PR / 大改走提案"的明文线，修 bug 也纠结，反促绕过。

根因（与历史另一项目的"文档发散"同源）：**缺少机器强制的单一真值闸门**——治理靠人自觉就会塌。本 change 把"提案先于代码"从习惯升级为硬闸门。

## 2. 现状（Before）
- `.claude/hooks/commit-gate.sh` 仅做 `--no-verify` 拦截 + `npm run verify`。
- `openspec/changes/_template.md` 缺 Test Plan / Non-Goals / 备选方案 / In Review 门槛 / 分级说明。
- `CLAUDE.md` §5 第 3 步将 openspec 写成**条件式软提示**，§8 硬约束里无"提案先行/分级"条款。
- `project/decisions.md` 无 ADR 模板段，无纪律强化决策记录。

## 3. 变更内容（After）
1. **commit-gate 加闸门 A（提案先行）**：改动 SSOT（`product/prd.md` / `design/design-tokens.md` / `packages/shared/src/`）的提交，必须满足其一才放行——(A1) 同提交纳入一个 `status: Accepted` 的 change 文件；或 (A2) commit message（含 -m / heredoc 正文）引用某个已 Accepted 的 change 号。否则 `exit 2` 阻断。原 verify 改为闸门 B。
2. **升级 `_template.md`**：补 `6. 验收 + Test Plan（通过前置）`、`7. 明确不做（Non-Goals）`、`8. 备选方案与取舍`、`9. 未决问题`，并在头部写明分级规则与 In Review 门槛（Test Plan 未填不得进 In Review；status 未到 Accepted 不得动代码）。
3. **CLAUDE.md**：§5 流程明确**分级铁律**（小改走 PR / 大改先提案）；§8 新增硬约束「提案先于代码、顺序不可逆、禁止事后补提案、`commit-gate` 机器守门」。
4. **decisions.md**：文件头补 **ADR 模板规范**；新增 **ADR-0010** 记录本纪律强化决策。

**不改**：PRD §10/§11、design-tokens、api-spec、`packages/shared`、任何业务代码与测试——0 业务/契约/SSOT 改动，纯工程纪律治理。

## 4. 影响范围（Impact）
- [ ] product/prd.md（不改）
- [ ] design/api-spec.md / design/design-tokens.md（不改）
- [ ] packages/shared、apps/**（不改，0 代码改动）
- [x] .claude/hooks/commit-gate.sh（加闸门 A）
- [x] openspec/changes/_template.md（升级）
- [x] CLAUDE.md（§5/§8 纪律硬化）
- [x] project/decisions.md（ADR-0010 + ADR 模板）
- [x] openspec README 索引 / project/roadmap.md / sessions（留痕）

## 5. 门禁 / 错误码 影响
不触业务门禁矩阵 / 错误码。仅强化**提交期工程门禁**（commit-gate）。

## 6. 验收 + Test Plan（通过前置）
- [x] gate-A 逻辑 dry-run 验证：A2 命中已 Accepted change（如 0016）→ 放行；无引用 → 阻断；`-a/-am` 检出而 `--amend` 不误判；SSOT 路径正则命中正确。
- [x] `npm run verify` 仍 68 全绿（本 change 不动代码/测试）。
- [x] 本 change（0019）自身不触 SSOT 文件，故闸门 A 不拦其提交；可正常落库。
- 说明：纯流程/脚本治理，无 L1/L2/L3 业务断言需新增。

## 7. 明确不做（Non-Goals）
- 不引入 openspec CLI / CI（GitHub Actions）——本期仍以本地 commit-gate 守门（CI 化列为后续）。
- 不强制 `-F file` / 编辑器交互式提交的 message 解析（本仓库统一用 -m heredoc）。
- 不追溯重写历史 changes 0002–0011 的 `author`（保留历史原貌，仅以制度防止再犯）。

## 8. 备选方案与取舍
- **机器守门 vs 仅文档约束**：仅靠 CLAUDE.md 文字 = 回到"靠自觉"老路（两次失败根因）。选机器守门。
- **同提交纳入提案(A1) vs 仅 message 引用(A2)**：两者都支持——A1 适配"提案随实现"，A2 适配"提案先单独 Accepted、后续实现引用号"。
- **解析 message 来源**：heredoc 正文已在命令串内，-m/heredoc 均可解析；放弃支持编辑器/`-F`（本仓库不用，见 Non-Goals）。

## 9. 未决问题（Unresolved）
- 是否将闸门 A 上升为 CI 检查（防本地 hook 被绕过）——待引入 CI 时一并定。
- I-030/I-031（会员错误码 / 校验时机）仍 OPEN，属业务口径决策，不在本 change 范围。

## 10. 落地步骤
1. 改 `commit-gate.sh`（闸门 A + B），dry-run 验证逻辑。✅
2. 升级 `_template.md`。
3. 硬化 `CLAUDE.md` §5/§8。
4. `decisions.md` 加 ADR 模板 + ADR-0010。
5. 同步 openspec README 索引 / roadmap / session-log，状态置 Accepted。
6. `npm run verify` 确认无回归。

## 11. 决策记录
见 **ADR-0010**（提案先行闸门 + 分级规则）。
