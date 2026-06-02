---
id: 0002
title: 实现脚手架 + 共享 SSOT 镜像 + 统一信封 + 双层门禁基座
status: Accepted
author: Claude (impl)
created: 2026-05-29
updated: 2026-05-29
related_milestone: M3
related_issues: [I-016]
---

# 0002 · 实现脚手架 + 共享 SSOT 镜像 + 双层门禁基座

## 1. 动机（Why）
进入实现阶段，需要一个三端共享数据、SSOT 不漂移、门禁可独立校验的工程底座，作为后续所有切片（0003–0010）的地基。

## 2. 现状（Before）
仅有文档（PRD/api-spec/architecture）与静态原型，无可运行代码；ADR-0004 推荐 pnpm。

## 3. 变更内容（After）
- monorepo（**npm workspaces**，非 pnpm）：`apps/web`(Vite+React+TS+Zustand+Router)、`apps/server`(Express+InMemoryStore)、`packages/shared`。
- `packages/shared`：`enums.ts/errorCodes.ts/copy.ts/types.ts` —— §10/§11 的代码镜像，前后端唯一引用源。
- 统一信封 `{code,message,data}`（`middleware/envelope.ts`）。
- 双层门禁基座：后端 `middleware/auth.ts`(1001) + `middleware/gate.ts`(2001/2002)；前端 `lib/gate.ts` GateGuard 在 0005 接入。
- 后端 :3001、前端 :5173（Vite 代理 /api）。

| 项 | 旧 | 新 |
|----|----|----|
| 包管理 | pnpm（ADR-0004） | npm workspaces（环境无 pnpm，I-016） |
| API 端口 | 3001（dev-guide） | 3001（本机 3000 被占，I-015） |

## 4. 影响范围（Impact）
- [x] engineering/（apps/* + packages/shared 落地；frontend-files/backend-files 蓝图）
- [x] design/system-architecture.md §6.1 实现落地
- [ ] PRD / 文案 / 视觉（无业务变更）

## 5. 门禁 / 错误码 影响
建立后端门禁中间件骨架（1001/2001/2002）；展示服务 2003 在 0003 接入。

## 6. 验收标准（Acceptance）
- [x] `npm install && npm run dev:server && npm run dev:web` 起得来。
- [x] `/api/health` 返回信封；前端访问 :5173 渲染。
- [x] 前后端共享 `@apex/shared`，编译期一致。

## 7. 落地步骤
已完成（见 CHANGELOG [Unreleased]）。

## 8. 决策记录
npm workspaces 偏离 ADR-0004（pnpm）→ 登记 I-016；端口 I-015。无新 ADR，本 change 为决策载体。
