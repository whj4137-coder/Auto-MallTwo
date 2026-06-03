---
id: NNNN
title: <一句话描述变更>
status: Draft            # Draft | In Review | Accepted | Rejected | Superseded
author: <提案人>
created: YYYY-MM-DD
updated: YYYY-MM-DD
related_milestone: <M0–M5>
related_issues: []        # 如 [I-002]
supersedes: []            # 取代了哪些旧 change（被取代方状态改 Superseded by NNNN）
---

<!--
分级规则（照 Rust RFC / K8s KEP）——决定要不要写这份提案：
  · 小改 → 直接走 PR/commit + issue，不需要本提案：
      bugfix（回归到既有规格）、重构、纯补测试、文档、纯性能。
  · 大改 → 必须先有一份 status: Accepted 的本提案，再动代码：
      改 商品/价格/文案/门禁/错误码/订单号/接口契约/布局形态 等任何 WHAT。
顺序铁律：status 未到 Accepted 不得动业务代码；禁止"先写代码再补提案"。
In Review 门槛：第 6 节 Test Plan 未填，不得从 Draft 进 In Review。
-->

# NNNN · <标题>

## 1. 动机（Why）
<为什么要做这个变更？当前约定有什么问题，或新增了什么诉求？这是最重要的一节。>

## 2. 现状（Before）
<引用当前的真值：哪条 data-contract / 哪条文案 / 哪个接口。贴出当前内容。>

## 3. 变更内容（After）
<明确改成什么。字面值变更请逐条列「旧 → 新」。>

| 项 | 旧值 | 新值 |
|----|------|------|
|    |      |      |

## 4. 影响范围（Impact）
- [ ] product/prd.md §10 数据契约
- [ ] product/prd.md §11 文案锁定
- [ ] product/prd.md 需求清单(§7)/其它章节
- [ ] design/api-spec.md
- [ ] design/design-tokens.md
- [ ] design/prototype/
- [ ] engineering/（实现）
- [ ] testing/（用例）
- [ ] 其他：____

## 5. 门禁 / 错误码 影响
<是否触及门禁矩阵或错误码？若否，写「无」。>

## 6. 验收 + Test Plan（★通过前置，未填不得进 In Review）
<怎样算改完？给出可验证判据，并指明动代码前就要补哪些测试：>
- L1（单元）：____
- L2（接口/集成）：____
- L3（E2E，如涉及流程）：____

## 7. 明确不做（Non-Goals）
<划清边界，防范围蔓延与"顺手改"。若无，写「无」。>

## 8. 备选方案与取舍
<为什么选这个设计？放弃了哪些方案、为什么？不做的代价是什么？>

## 9. 未决问题（Unresolved）
<动手前需先在评审中解决的点；以及留待实现期再定的点。若无，写「无」。>

## 10. 落地步骤
1. 更新真值文档：____
2. 改代码：____
3. 改/加测试：____
4. 同步 openspec README 索引 / roadmap / session-log，状态置 Accepted。

## 11. 决策记录
<是否需要在 project/decisions.md 留 ADR？若是，写 ADR 编号；若否，写「无」。>
