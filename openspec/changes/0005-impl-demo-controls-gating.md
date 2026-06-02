---
id: 0005
title: 演示控制与门禁前端（DemoBar 三态 / GateGuard 续作 / 重置）
status: Accepted
author: Claude (impl)
created: 2026-05-29
updated: 2026-05-29
related_milestone: M3
related_issues: []
---

# 0005 · 演示控制与门禁前端

## 1. 动机（Why）
实现 SPEC-003：三态仅 Demo Bar 手动切换、写入门禁优先级 DRIVING>OFFLINE>GUEST、GUEST 登录后自动续作、一键重置。

## 2. 现状（Before）
后端门禁中间件已在 0002/0003 就位；前端感知层与三态开关缺失。

## 3. 变更内容（After）
- `sessionStore`(auth/drive/net + token)、`uiStore`(toast 单条 + LoginDialog + pendingAction)。
- `lib/gate.ts` GateGuard：DRIVING→COPY-001 / OFFLINE→COPY-002（均不发请求）/ GUEST→弹 LoginDialog 并续作；`GatedButton` 置灰态。
- `DemoBar` 三段开关（绝不自动触发）+ 重置数据（POST /demo/reset + 前端 store 复位 + 跳 P1）；`LoginDialog`(P12) 预填 admin/123456。

## 4. 影响范围（Impact）
- [x] apps/web stores/lib/components；apps/server routes/demo.ts
- [ ] PRD/文案（无变更）

## 5. 门禁 / 错误码 影响
前端 GateGuard 与后端 1001/2001/2002 双层一致；优先级与单条 toast 已实现。

## 6. 验收标准（Acceptance）
- [x] GUEST 加购→LoginDialog→登录后自动续作（浏览器验）。
- [x] DRIVING：按钮置灰 + COPY-001，不发请求（浏览器验）。
- [x] 重置：会话清空 + 回 GUEST/PARKED/ONLINE + 跳 P1。

## 7. 落地步骤
已完成。

## 8. 决策记录
无新 ADR。
