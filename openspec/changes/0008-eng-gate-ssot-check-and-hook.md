---
id: 0008
title: 工程门禁 —— SSOT 字面值校验 + commit hook + typecheck（verify）
status: Accepted
author: Claude (impl)
created: 2026-05-29
updated: 2026-05-29
related_milestone: M4
related_issues: [I-018]
---

# 0008 · 工程门禁（SSOT 校验 + hook）

## 1. 动机（Why）
"代码不重抄 §10/§11"原本只靠自觉。根因：缺机器校验。需把它变成 git 拦得住的硬门禁（呼应 CLAUDE.md §7/§10）。

## 2. 现状（Before）
仅有 typecheck；无 SSOT 字面值校验；commit 不受钩子约束。

## 3. 变更内容（After）
- `scripts/check-ssot.mjs`：以 `copy.ts`(§11)+`seed.ts`(§10) 为镜像，扫 apps/packages 源码，"完整字符串/JSX 文本"重复 SSOT 即报错（排除类目标签/注释/子串误报）。
- 根 `package.json`：`check:ssot` / `verify`(=typecheck+check:ssot)。
- `.claude/settings.json`(PreToolUse:Bash) → `.claude/hooks/commit-gate.sh`：拦真实 `git commit` 跑 verify，不过 exit 2 阻断；`--no-verify` 直接拦。

## 4. 影响范围（Impact）
- [x] scripts/、package.json、.claude/（settings.json + hooks/）
- [x] CLAUDE.md §6/§7/§10、engineering/dev-guide §2
- [ ] 业务（无）

## 5. 门禁 / 错误码 影响
工程层门禁，不涉业务错误码。

## 6. 验收标准（Acceptance）
- [x] `npm run verify` 绿（83 锁定值 0 重复 + typecheck 0 错）。
- [x] hook 三态：echo 提及不触发 / --no-verify 拦 / 真实 commit 跑 verify。

## 7. 落地步骤
已完成。

## 8. 决策记录
建议补 ADR-0009「工程门禁：SSOT 校验 + commit hook」（长期保留）。
