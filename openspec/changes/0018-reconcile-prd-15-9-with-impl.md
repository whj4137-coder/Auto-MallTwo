---
id: 0018
title: PRD §15.9 前台交互详规 ↔ apps/web 实现逐条核对与对齐
status: Accepted
author: Claude
created: 2026-06-02
updated: 2026-06-02
related_milestone: M5
related_issues: []
---

# 0018 · PRD §15.9 ↔ 实现逐条核对与对齐

> **状态（S-046）：已完成。** 24 条偏离经执行 change 0020（H1/H2/H4/M1/M5/M6/M7/M13/L2）、0021（H3/M2/M12）、0022（M3/M4/M8/M9/M10/L1/L3/L4/L5/L6/L7）全部对齐，本父审计单转 Accepted。

## 1. 动机（Why）
change 0017 校准派生文档 `component-spec.md` 时立了一条边界：派生文档可追平实现，但**与 PRD §15.9（前台页面级交互详规，冻结契约）的实质行为差异必须回到 openspec 解决**，不得借派生文档绕过 SSOT。本 change 即专门做这件事：把 §15.9（P1–P13 + 全局框架，§15.9.1–15.9.14）逐条与 `apps/web` 实现核对，列出真实偏离，并对每条给出对齐方向。

§15.9 是已冻结的交互契约（S-031 评审通过）。实现亦已冻结并通过评审。两者若有差异，可能是：
- (a) 实现偏离了应有交互 → **改代码对齐 §15.9**（同 0012/0015/0016 性质）；
- (b) §15.9 写的是早期设想、实现按更优方案落地且评审默认接受 → **改 §15.9 对齐实现**（PRD 变更，需本提案显式记录理由）；
- (c) 派生文档/测试已覆盖，无实质差异 → 标注即可。

## 2. 方法（How）
- 逐条读 §15.9.1–15.9.14 规则，对照 `apps/web/src/pages/*`、`components/*`、`lib/gate.ts`、`stores/*` 实现。
- 每条判定：一致 / 偏离 / 无法判定；偏离记 文件:行号 + 性质（缺失/不一致/反向）+ 严重度（高=演示主路径；中=边界/异常路径；低=措辞/非关键）。
- 主路径（A-01/A-02/B-01/门禁/搜索/重置）此前 E2E + L2 已验证为正确，预期偏离集中在**异常/边界/非关键装饰**（骨架屏、错误态 UI、刷新恢复、防重复点击、Toast 时长等）。

## 3. 偏离清单（Findings）
> 审计完成（S-044，逐页核对 + 关键项人工复核 http.ts/Result/Home/GatedButton）。**共 24 条偏离：高 4 / 中 13 / 低 7**。主路径（A-01/A-02/B-01/门禁/搜索/重置）此前 E2E+L2 已验证正确；偏离全部集中在**异常态 / 刷新恢复 / 防重 / 边界装饰**。建议方向：g=改代码对齐、d=改 §15.9 降级为 Demo 简化、c=无实质差异。

### 高（4）
| # | §规则 | 实现（文件:行号） | 性质 | 建议 |
|---|-------|------------------|------|------|
| H1 | 全局：网络失败显 COPY-038 | `lib/http.ts:24-30` fetch 无 try/catch，断网抛未捕获 rejection，全站无 COPY-038 | 缺失 | g |
| H2 | P1：API-001 失败保留 Shell + 可重试 | `Home.tsx:18,21` 失败永久"加载中…"，无 Shell/重试 | 缺失 | g |
| H3 | P9：刷新按 orderNo 调 API-024 | `Result.tsx:9` 仅读 router `location.state`，刷新即丢失变空白 | 缺失 | g/d |
| H4 | 通用：加载失败页可恢复（P1 为最关键主路径实例） | 各页 fallback 恒"加载中…"（`Home.tsx:21` 等） | 缺失 | g/d |

### 中（13）
| # | §规则 | 实现（文件:行号） | 性质 | 建议 |
|---|-------|------------------|------|------|
| M1 | 全局：5000 显 COPY-037 | 各页 `env.code===OK &&` 模式，5000 静默 | 缺失 | g/d |
| M2 | 全局：写入按钮防重复点击 | `GatedButton.tsx:17-27`、`Pay.tsx:24` 无 pending 锁 | 缺失 | g |
| M3 | 全局/P12：取消清 PendingAction | `LoginDialog.tsx:30,41,54` cancel/× 只 closeLogin，不清 pending | 不一致 | g |
| M4 | P1：搜索框按门禁分流（DRIVING 语音 C004 / OFFLINE C002） | `Home.tsx:40-46` 恒跳 /search，无禁用；gating 仅在 `Search.tsx:43-48` | 缺失 | g/d |
| M5 | P2：空态「返回推荐」回 P1 | `Category.tsx:46` 空时仅空网格 | 缺失 | g |
| M6 | P2：类目不存在 4004→COPY-036 | `Category.tsx:28` 非 OK 静默 | 缺失 | g/d |
| M7 | P3：4004→COPY-036+COPY-044 返回 | `ProductDetail.tsx:34` 失败恒"加载中…" | 缺失 | g/d |
| M8 | P5：灰按钮点击只提示 | `ServiceDetail.tsx:29` disabled，点击无 toast | 不一致 | g |
| M9 | P6：DRIVING/OFFLINE 只读**禁用** | `Cart.tsx:52,59,61,64` 走 guardWrite 弹 toast，未置灰 | 不一致 | g/d |
| M10 | P6：下架/售罄项标记 + 结算 COPY-045/046 | `Cart.tsx:28,50-66` 无 unavailable 标记，结算仅 toast env.message | 缺失 | g |
| M11 | P8：重复支付 4009 专属处理 | `Pay.tsx:26,48` 仅 toast env.message | 不一致 | g/d |
| M12 | P9：orderNo 查不到 COPY-036 | `Result.tsx` 无该分支 | 缺失 | g/d |
| M13 | P10/P13：1001→LoginDialog（GUEST 进订单） | `Orders.tsx:16`/`OrderDetail.tsx:15` 1001 静默不弹登录 | 缺失 | g |

### 低（7）
| # | §规则 | 实现（文件:行号） | 性质 | 建议 |
|---|-------|------------------|------|------|
| L1 | 全局：Toast 同时刻单条 + 优先级覆盖 | `Toast.tsx:15` map 渲染全部；`uiStore.ts:25` 追加不覆盖（2.5s 时长✅，靠 gate 单抛保证优先级） | 不一致 | c/d |
| L2 | 全局：首次加载骨架屏 | 各页 fallback 为"加载中…"，无 skeleton | 缺失 | d |
| L3 | P2：展示服务显「服务展示」价格占位 | `Category.tsx:49,61` DISPLAY 仍渲染 yuan(price) | 不一致 | g |
| L4 | P4：售罄置灰 COPY-046 | `Membership.tsx:62` 无 soldOut 判断 | 缺失 | g |
| L5 | P5：缺 COPY-007/008 | `ServiceDetail.tsx` 仅 C006/C042 | 缺失 | g/d |
| L6 | P10/P13：status 标签写死 | `Orders.tsx:52`/`OrderDetail.tsx:27` 恒 C032/033 未读 o.status | 不一致 | g |
| L7 | P11：会员卡 ACTIVE 缺绑定车辆+orderNo | `Mine.tsx:34` 仅显状态文字 | 缺失 | g |

> 已坐实 6 个疑点：①P9 刷新无 API-024 ✓ ②Toast 时长对、"单条/优先级覆盖"靠调用方非组件 ✓（半真）③骨架屏未实现 ✓ ④5000/网络失败错误态无 UI ✓ ⑤P1 搜索框门禁分流仅 Search 页内有 ✓ ⑥防重复点击未实现 ✓。
> 等价实现（非偏离）：P4 API-017 经 membershipStore（等价）；Toast 2.5s 时长符合。

## 4. 处理决策（已定）
**用户决策（S-044）：全量对齐 §15.9 —— 24 条全部走方向 g（改代码补齐到契约）+ 补测试。** 本 0018 作为父审计单跟踪；执行拆为以下 3 个执行 change，**重代码、用测试锁、文档从简**（吸取项目"流程空转"教训，避免为每条单开 doc）。
> 编号说明：0019 被并发会话占用（工程纪律强化），故执行 change 顺延为 0020/0021/0022。

| 执行 change | 覆盖偏离 | 主题 | 机器门 |
|-------------|----------|------|--------|
| 0020 | H1·H2·H4·M1·M5·M6·M7·M13·L2 | 全局加载/错误/空态基座：网络失败 COPY-038、5000 COPY-037、4004 COPY-036、各页加载失败可重试、空态、1001→登录、骨架；Confirm/Pay 失效态 | L2(后端错误码已覆盖) + L3 主路径无回归 + typecheck |
| 0021 | H3·M2·M12 | P9 刷新恢复（orderNo→API-024）+ orderNo 查不到 COPY-036 + 写入按钮防重复点击 | L3 刷新恢复 E2E + typecheck |
| 0022 | M3·M4·M8·M9·M10·L1·L3·L4·L6·L7·L5 | 交互细节对齐：登录取消清 pending、P1 搜索门禁分流、P5 灰按钮提示、P6 只读禁用 + 下架售罄标记、status 读 o.status、展示服务价格占位、P4 售罄、P11 会员卡、Toast 单条、COPY-007/008 | L3 关键项 + typecheck + check:ssot |

> 说明：前端交互类偏离机器可测性弱（L1/L2 为后端，L3 Playwright 不在 commit 门禁）。落地策略：能用 L2 锁后端错误码的锁 L2；前端关键路径（断网态、刷新恢复、防重）补 L3；纯装饰（骨架/Toast 样式）以 typecheck + 人工浏览器验证为准，不强造脆弱断言。

## 5. 影响范围（Impact）
- [ ] product/prd.md §15.9（**可能改**，方向 b 的条目；改前在本提案记录理由）
- [ ] apps/web/**（**可能改**，方向 a 的条目；改后补对应测试）
- [ ] design/component-spec.md（如随对齐更新）
- [ ] testing/（方向 a 落地需补 L2/L3）
- [x] 本 change 文档 / openspec README 索引 / sessions（留痕）

## 6. 验收标准（Acceptance）
- [ ] §15.9.1–15.9.14 每条均有「一致 / 偏离+方向」判定，无遗漏。
- [ ] 每条方向 a/b 经用户确认。
- [ ] 方向 a 的代码改动有测试覆盖、`npm run verify` 全绿。
- [ ] 方向 b 的 §15.9 改动在本提案留有理由记录。
- [ ] 收尾时本 change 转 Accepted 或拆分为执行 change 并交叉引用。

## 7. 落地步骤
1. （进行中）逐页核对，填 §3 偏离清单。
2. 向用户汇报，逐条定方向 a/b/c。
3. 方向 a：改代码 + 补测试；方向 b：改 §15.9 + 记理由；方向 c：标注。
4. `npm run verify` 全绿；同步 component-spec / README / session-log，状态转 Accepted。

## 8. 决策记录
无需新 ADR。本 change 是 0017 边界声明的兑现：交互契约的实质差异回到 openspec，按条对齐，不静默漂移。
