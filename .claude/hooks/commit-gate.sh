#!/usr/bin/env bash
# CLAUDE.md §10 强制校验：拦截真正的 git commit 调用。
# 两道闸门：
#   闸门 A（提案先行）：改动 SSOT（product/prd.md / design/design-tokens.md / packages/shared/src）
#                       的提交，必须引用一个状态为 Accepted 的 openspec 提案；否则阻断。
#   闸门 B（R5 verify）：typecheck + SSOT 字面值校验 + L1/L2 测试，不过则阻断。
# PreToolUse(Bash) 钩子：stdin 收 {tool_input:{command}}，exit 2 = 阻断并把 stderr 回灌给模型。
set -euo pipefail

input="$(cat)"
cmd="$(printf '%s' "$input" | python3 -c 'import sys,json; print(json.load(sys.stdin).get("tool_input",{}).get("command",""))' 2>/dev/null || true)"

# 触发条件：命令里有 git 调用（命令起始/经 ; && | 链接，允许 cd 前缀）且含 commit 子命令。
# 容忍 git 与 commit 之间的任意 flag（如 `git -c user.email=x commit`、`git --no-pager commit`）。
# 误判风险（如 `git log --grep commit`）仅多跑一次检查，无害。
is_git=$(printf '%s' "$cmd" | grep -Eq '(^|[;&|])[[:space:]]*(cd[^&|;]*&&[[:space:]]*)?git([[:space:]]|$)' && echo y || true)
has_commit=$(printf '%s' "$cmd" | grep -Eq '(^|[[:space:]])commit([[:space:]]|$)' && echo y || true)

if [ "$is_git" = y ] && [ "$has_commit" = y ]; then
  if printf '%s' "$cmd" | grep -q -- '--no-verify'; then
    echo "[commit-gate] 禁止 --no-verify 绕过提交门禁（CLAUDE.md §6/§10）。" >&2
    exit 2
  fi
  root="$(cd "$(dirname "$0")/../.." && pwd)"

  # ---------- 闸门 A：提案先行（改 SSOT 必引用 Accepted 提案）----------
  # SSOT 锁定区（CLAUDE.md §8）：业务数据契约 + 文案 + 视觉 token 的代码/文档源。
  ssot_re='^(product/prd\.md|design/design-tokens\.md|packages/shared/src/)'
  staged="$(cd "$root" && git diff --cached --name-only 2>/dev/null || true)"
  # `git commit -a/-am` 会在提交时顺带暂存已跟踪改动，PreToolUse 此刻尚未入暂存区，需并入未暂存改动一起判定。
  if printf '%s' "$cmd" | grep -Eq '(^|[[:space:]])-[A-Za-z]*a'; then
    staged="$staged
$(cd "$root" && git diff --name-only 2>/dev/null || true)"
  fi
  ssot_hit="$(printf '%s\n' "$staged" | grep -E "$ssot_re" | sort -u || true)"

  if [ -n "$ssot_hit" ]; then
    pass=""
    # 通过条件 A1：本次提交同时纳入了一个 status: Accepted 的 change 文件（提案随实现同提交）。
    while IFS= read -r f; do
      case "$f" in
        openspec/changes/[0-9]*.md)
          if (cd "$root" && grep -Eq '^status:[[:space:]]*Accepted' "$f" 2>/dev/null); then pass=y; fi ;;
      esac
    done <<EOF
$(printf '%s\n' "$staged" | sort -u)
EOF
    # 通过条件 A2：commit message（含 -m / heredoc 正文，均在 $cmd 内）引用了某个已 Accepted 的 change 号。
    if [ "$pass" != y ]; then
      for n in $(printf '%s' "$cmd" | grep -oE '0[0-9]{3}' | sort -u); do
        cf="$(cd "$root" && ls openspec/changes/${n}-*.md 2>/dev/null | head -1 || true)"
        if [ -n "$cf" ] && (cd "$root" && grep -Eq '^status:[[:space:]]*Accepted' "$cf"); then pass=y; fi
      done
    fi
    if [ "$pass" != y ]; then
      echo "[commit-gate] 闸门 A 阻断：本次提交改动了 SSOT，但未引用任何 Accepted 的 openspec 提案。" >&2
      echo "  命中的 SSOT 文件：" >&2
      printf '    - %s\n' $ssot_hit >&2
      echo "  修复二选一：" >&2
      echo "    1) 让对应 openspec change 进入 Accepted，并在 commit message 写明 change 号（如 0018）；" >&2
      echo "    2) 将该 Accepted change 文件一并纳入本次提交。" >&2
      echo "  原则（CLAUDE.md §5/§8）：改业务/契约/文案，提案先于代码，禁止事后补提案。" >&2
      exit 2
    fi
  fi

  # ---------- 闸门 B：R5 verify ----------
  if ! (cd "$root" && npm run -s verify >/tmp/apex-commit-gate.log 2>&1); then
    echo "[commit-gate] 闸门 B 阻断：verify（typecheck + SSOT 字面值校验 + L1/L2）未通过。" >&2
    echo "修复后重试；日志见 /tmp/apex-commit-gate.log（末尾）：" >&2
    tail -n 20 /tmp/apex-commit-gate.log >&2 || true
    exit 2
  fi
  echo "[commit-gate] 闸门 A（提案先行）+ 闸门 B（verify）✓ 允许提交。" >&2
fi
exit 0
