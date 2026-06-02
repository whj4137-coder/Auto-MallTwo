#!/usr/bin/env bash
# CLAUDE.md §10 强制校验：拦截真正的 git commit 调用，先过 R5 verify（typecheck + SSOT 校验），不过则阻断。
# PreToolUse(Bash) 钩子：stdin 收 {tool_input:{command}}，exit 2 = 阻断并把 stderr 回灌给模型。
set -euo pipefail

input="$(cat)"
cmd="$(printf '%s' "$input" | python3 -c 'import sys,json; print(json.load(sys.stdin).get("tool_input",{}).get("command",""))' 2>/dev/null || true)"

# 触发条件：命令里有 git 调用（命令起始/经 ; && | 链接，允许 cd 前缀）且含 commit 子命令。
# 容忍 git 与 commit 之间的任意 flag（如 `git -c user.email=x commit`、`git --no-pager commit`）。
# 误判风险（如 `git log --grep commit`）仅多跑一次 verify，无害。
is_git=$(printf '%s' "$cmd" | grep -Eq '(^|[;&|])[[:space:]]*(cd[^&|;]*&&[[:space:]]*)?git([[:space:]]|$)' && echo y || true)
has_commit=$(printf '%s' "$cmd" | grep -Eq '(^|[[:space:]])commit([[:space:]]|$)' && echo y || true)
if [ "$is_git" = y ] && [ "$has_commit" = y ]; then
  if printf '%s' "$cmd" | grep -q -- '--no-verify'; then
    echo "[commit-gate] 禁止 --no-verify 绕过提交门禁（CLAUDE.md §6/§10）。" >&2
    exit 2
  fi
  root="$(cd "$(dirname "$0")/../.." && pwd)"
  if ! (cd "$root" && npm run -s verify >/tmp/apex-commit-gate.log 2>&1); then
    echo "[commit-gate] R5 提交门禁失败：verify（typecheck + SSOT 字面值校验）未通过，已阻断 git commit。" >&2
    echo "修复后重试；日志见 /tmp/apex-commit-gate.log（末尾）：" >&2
    tail -n 20 /tmp/apex-commit-gate.log >&2 || true
    exit 2
  fi
  echo "[commit-gate] verify ✓（typecheck + SSOT）允许提交。" >&2
fi
exit 0
