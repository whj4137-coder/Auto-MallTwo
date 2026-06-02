---
id: 0014
title: EDGE-001..025 逐条自动化落地（L2 边界用例）
status: Accepted
author: Claude
created: 2026-06-02
updated: 2026-06-02
related_milestone: M5
related_issues: []
---

# 0014 · EDGE-001..025 逐条落地（已落地）

## 1. 动机（Why）
PRD §15.12 定义了 EDGE-001..025 共 25 条边界口径，coverage-matrix §7 把"逐条落地"列为缺口。0013 后部分已被现有 L2/L3 覆盖，但仍有一批后端可测的边界无精确断言（如改价后历史订单不变、checkout 被 reset 后失效、订单后下架不影响详情快照、reset 仅清会话保留商品改动等）。本 change 把可后端断言的 EDGE 逐条补到 L2；纯补测试，不改 WHAT/契约。

## 2. 现状（Before）· EDGE 覆盖映射
| EDGE | 口径 | 现状 |
|------|------|------|
| 001 同 SKU 加购合并≤5 | L2 仅有 qty:99→5；缺增量 4+3→5 | 补 |
| 002 不同 SKU 不合并 | 无 | 补 |
| 003 购物车下架→结算 4009 DELISTED | 已有 | ✓ |
| 004 购物车售罄→结算 4009 SOLD_OUT | 仅有"售罄加购"；缺 cart→改售罄→结算 | 补 |
| 005 改价后结算按新价 + 历史订单不变 | 无 | 部分补* |
| 006 SKU 被删除 | 系统不做硬删（§15.14 删除=下架）→等价 003 | N/A |
| 007 BUY_NOW 不影响购物车 | 0013 已补 L2 + L3 A-02 | ✓ |
| 008 会员 ACTIVE 后开另一张卡 | L2 互斥幂等已覆盖"不新增单"；按钮态属前端 | ✓/前端 |
| 009/010/011 支付页切行车/断网/登出 | L2 pay OFFLINE→2002、GUEST→1001；UI 置灰由 L3 D-01/D-02/AUTH-01 覆盖 | ✓/L3 |
| 012 checkout 被 reset 清掉→旧 checkout 失效 | 无 | 补 |
| 013 重复支付→4009 ALREADY_PAID | 已有 | ✓ |
| 014 订单商品后续下架→详情快照不变 | 无 | 补 |
| 015 搜索展示服务名→空 | 已有（排除展示服务） | ✓ |
| 016 搜索下架商品→不返回 | 无 | 补 |
| 017 首页服务货架下架→缺项不补 | 仅有实物 shelf；缺服务货架 | 补 |
| 018 banner target 下架→不进详情 | 已有（home 过滤 banner） | ✓ |
| 019 Admin 无效 target 保存→4000 | 已有 | ✓ |
| 020 Admin reset 会话→清订单/会员/购物车，保留商品改动 | 仅断言 orders/seq 清空；缺"商品改动保留" | 补 |
| 021 GUEST 查看我的 | 0013 已补（/me 无鉴权） | ✓ |
| 022 OFFLINE 看已加载订单详情 | 前端只读行为 | 前端 |
| 023 DRIVING 搜索输入禁用 | 前端行为 | 前端 |
| 024 多重门禁 GUEST+DRIVING+OFFLINE→2001 | 仅有"未登录+行车"；缺三重 | 补 |
| 025 GUEST+OFFLINE→2002 | 已有 | ✓ |

## 3. 变更内容（After）
在 `apps/server/src/api.test.ts` 追加 `describe("EDGE 边界（§15.12）")` 块，补 10 条：EDGE-001/002/004/005/012/014/016/017/020/024。字符串/价格不硬编码 §10 锁定值——颜色经 `GET /products` 动态取、改价用非种子数值。

> **\*EDGE-005 发现的行为偏离（I-029）**：落地用例时发现 CART 来源 checkout 按"加购时快照价"定价，Admin 改价后**不**对进行中的 CART 结算重新定价；PRD §15.12 期望按新价（BUY_NOW 路径确实读实时价）。本 change 范围为"纯补测试"，不改定价逻辑——EDGE-005 仅断言可验证且无争议的一半（落单后改价、历史订单金额快照不变），重定价偏离登记为 [I-029](../../project/issues.md) 待用户决策（改代码对齐 PRD，或改 PRD 接受快照定价）。

| 项 | 旧值 | 新值 |
|----|------|------|
| L2 用例数（api.test.ts） | 48 | 58 |
| `npm run verify` 总测数 | 55 | 65 |

## 4. 影响范围（Impact）
- [ ] product/prd.md（不改）
- [ ] design/api-spec.md（不改）
- [x] apps/server/src/api.test.ts（仅追加用例）
- [x] testing/coverage-matrix.md（EDGE 缺口收敛）、test-strategy.md（计数）
- [x] CHANGELOG / sessions / openspec README 索引

## 5. 门禁 / 错误码 影响
不新增。补测既有 4009/4004/2001 在边界场景下的口径。

## 6. 验收标准（Acceptance）
- [x] `npm run verify` 全绿，L2 48→58、总测 55→65。
- [x] EDGE-001/002/004/005/012/014/016/017/020/024 各有对应断言；映射表中 ✓/N/A/前端 项有据可依。
- [x] 无产品代码改动（git diff 仅测试 + 文档）。

## 7. 落地步骤
1. 追加 EDGE L2 用例至 api.test.ts。
2. 更新 coverage-matrix §7（EDGE 收敛）、test-strategy §7 计数。
3. `npm run verify` 复跑确认 65 绿。
4. 同步 CHANGELOG / session-log / openspec README，状态置 Accepted。

## 8. 决策记录
无需新 ADR。前端门禁 UI 边界（009/010/011/022/023）沿用既有 L3 D-01/D-02/AUTH-01 覆盖；EDGE-006 因无硬删除而 N/A。
