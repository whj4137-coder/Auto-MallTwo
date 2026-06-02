# HANDOFF — 仓库级

> 已有多个 changes（0001–0010）。本文件维护仓库级总览；逐 change 细节见各 `changes/NNNN-*.md`。
> 模板见 [../docs/templates/HANDOFF.template.md](../docs/templates/HANDOFF.template.md)。

**更新时间**：2026-06-02 ｜ **会话**：S-043 ｜ **active changes**：0001–0015 全 **Accepted**；SPEC-001..005 **APPROVED**（已冻结）

## 1. 停在哪（Where we stopped）
- **可交互核心闭环已实现并联调通过**：monorepo（apps/web + apps/server + packages/shared，npm workspaces）。前台 P1–P13 + 搜索页 + Admin 六模块（含「账号信息」只读）+ Express 后端 + 双层门禁 + Demo 重置。
- **实现已按能力切片走 openspec**：0001–0011 全 Accepted，SPEC-001..005 全 APPROVED。roadmap 与 openspec changes 索引 1:1 对齐。
- **工程门禁就位**：`npm run verify`（typecheck + check:ssot + L1/L2，change 0015 后共 **66**）+ commit-gate hook；L3 Playwright 单独 `npm run test:e2e`（10，含 LAYOUT-01/ADMIN-01）。
- **1.0.0 已准备**：版本号、CHANGELOG、演示脚本、Admin 价格换算、首页 Hero 价格、下架商品 Banner 过滤均已收口。
- **WebView APK + 公网部署路线已补底座**：`android-webview/` 横屏 WebView 壳、Docker 单服务部署、Express 托管 `apps/web/dist`、部署指南已入库。

## 2. 下次接（Next action）
> M-A/M-B/M-C/M-F 主体已完成；M-E 车机 WebView 本期不做（ADR-0009）。
> **S-037 已在本机实跑完成**：`verify` 30 测全绿、`test:e2e` 9/9 绿（含 LAYOUT-01）、debug APK 工具链验证产出、本地单服务部署验证；本地已打 `v1.0.0` tag。
1. ~~终验复跑~~ ✅ S-037：`verify` + `test:e2e`（含 LAYOUT-01）全绿。
2. **公网部署（暂缓）**：按 `docs/deployment/WEBVIEW_PUBLIC_DEPLOY.md` 部署单服务到对外域名（本地单服务已验证 `/`、`/admin`、`/api/*`）。待用户提供对外域名后执行。
3. **APK 真实 URL 构建（暂缓）**：工具链已验证可在本机构建（openjdk@17 + Android SDK 已就绪）；待公网域名定后用 `-PWEBVIEW_URL=<域名>` 重建。
4. **push（暂缓）**：本地 commit + `v1.0.0` tag 已完成；待用户提供 git remote 后 push。

## 3. Blocked / Open questions
- I-019（已解，S-037）：在本机普通环境 `verify` + `test:e2e`（含 LAYOUT-01）已实跑全绿；Codex 沙箱限制仅针对沙箱会话。
- I-020（已解，S-037）：本机有 Homebrew `openjdk@17` + 完整 Android SDK，debug APK 工具链已验证可构建。
- **公网部署 / push 暂缓**：均待用户提供对外域名 / git remote（S-037 用户决定先本地收口）。
- I-015：本机 3000 端口被外部 Python 进程占用；项目后端用 3001，不阻塞。
- I-016：pnpm/corepack 不再作为 1.0.0 必要条件；仓库已按 npm workspaces 收口。
