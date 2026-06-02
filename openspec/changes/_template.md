---
id: NNNN
title: <一句话描述变更>
status: Draft            # Draft | In Review | Accepted | Rejected | Superseded
author: <提案人>
created: YYYY-MM-DD
updated: YYYY-MM-DD
related_milestone: <M0–M5>
related_issues: []        # 如 [ISS-002]
---

# NNNN · <标题>

## 1. 动机（Why）
<为什么要做这个变更？当前约定有什么问题，或新增了什么诉求？>

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

## 6. 验收标准（Acceptance）
<怎样算改完？给出可验证的判据，最好对应一条业务流程或测试用例。>

## 7. 落地步骤
1. 更新真值文档：____
2. 改代码：____
3. 改/加测试：____

## 8. 决策记录
<是否需要在 project/decisions.md 留 ADR？若是，写 ADR 编号；若否，写「无」。>
