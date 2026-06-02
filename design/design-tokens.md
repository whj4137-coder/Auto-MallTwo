# 设计 Token — Apex Drive Store V2  ★SSOT

> **这是视觉的唯一真值。** 颜色/尺寸/字号/间距以本文件为准。代码禁止出现本文件之外的视觉字面值。
> 改动须走 [openspec](../openspec/README.md)。文案见 [../product/prd.md](../product/prd.md) §11，字面值见 [../product/prd.md](../product/prd.md) §10。
> 风格：**深色座舱（Dark Cockpit）**，仅一套主题（无明暗切换）。近黑深底 + 高对比白字 + 电青绿强调 + 琥珀金价格。

---

## 1. 颜色

| Token | 值 | 用途 | ui.css 变量 |
|-------|----|------|------|
| `color.bg.base` | #0b0e13 | 页面基底（近黑） | `--bg` |
| `color.bg.gradient.to` | #0f141c | 页面背景渐变止 | `--bg2` |
| `color.surface.card` | #141a23 | 卡片/面板背景 | `--panel` |
| `color.surface.raised` | #1a2230 | 抬升面板（输入框/二级面板） | `--panel2` |
| `color.border.card` | rgba(255,255,255,0.07) | 卡片细边框（发丝线） | `--line` |
| `color.border.accent` | rgba(34,211,197,0.22) | 强调发光边（聚焦/选中卡片） | `--line2` |
| `color.text.primary` | #eef3f8 | 主文字（高对比白） | `--ink` |
| `color.text.secondary` | #8b97a8 | 次级文字/副标题 | `--ink2` |
| `color.text.tertiary` | #5b6678 | 三级文字（标签/弱说明） | `--ink3` |
| `color.brand.primary` | #22D3C5 | 主操作色（电青绿） | `--teal` |
| `color.brand.deep` | #0e7490 | 深青（会员卡渐变止/辅助） | `--teal-d` |
| `color.price` | #FFB020 | 价格色（琥珀金） | `--amber` |
| `color.success` | #34D399 | 成功（绿） | `--green` |
| `color.violet` | #9b8cff | 紫（次级标识/会员强调） | `--violet` |
| `color.danger` | #ff6b6b | 错误/危险 | `--red` |

> 置灰按钮：强调色降透明度 + 文字用 disabled（不可用态），见 `color.disabledFill` / `color.text.disabled`。

## 2. 渐变 / 效果

| Token | 值 |
|-------|----|
| `gradient.page` | linear-gradient(160deg, #0b0e13 0%, #0f141c 100%) + 双 radial teal/deep 辉光 |
| `gradient.memberCard` | linear-gradient(135deg, #22D3C5 0%, #0E7490 100%) |
| `effect.cardShadow` | 0 8px 24px rgba(0,0,0,0.45) |
| `effect.accentGlow` | 0 0 0 1px rgba(34,211,197,0.30), 0 0 18px rgba(34,211,197,0.18) |
| `effect.hairline` | 1px solid rgba(255,255,255,0.07) |
| `effect.gridOverlay` | 48×48 网格线（`--line`），radial mask 自右上淡出，opacity .42 |
| `effect.grain` | SVG fractalNoise 颗粒，opacity .04，mix-blend overlay |

## 3. 圆角

| Token | 值 | 用途 |
|-------|----|------|
| `radius.card` | 14dp | 卡片（ui.css `--r-card`） |
| `radius.button` | 10dp | 按钮（ui.css `--r-btn`） |
| `radius.chip` | 999dp | 标签/胶囊 |
| `radius.input` | 12dp | 输入框 |

## 4. 间距（4 的倍数栅格）

| Token | 值 |
|-------|----|
| `space.xs` | 4dp |
| `space.sm` | 8dp |
| `space.md` | 16dp |
| `space.lg` | 24dp |
| `space.xl` | 32dp |
| `space.gutter` | 16dp（栅格间隔） |
| `space.pagePadding` | 24dp（主内容内边距） |

## 5. 字号 / 字重

| Token | 字号 | 字重 | 用途 |
|-------|------|------|------|
| `font.display` | 28dp | 700 | 页面大标题 / 应付金额 |
| `font.title` | 22dp | 700 | 卡片/区块标题 |
| `font.subtitle` | 18dp | 600 | 商品名 |
| `font.body` | 16dp | 400 | 正文 |
| `font.caption` | 13dp | 400 | 副标题/说明小字 |
| `font.price` | 24dp | 700 | 价格（用 color.price） |

字体族（三档，落自 ui.css）：
- `font.family.display` = `"Chakra Petch", "PingFang SC", "Microsoft YaHei", system-ui` —— 品牌字 / 大标题 / 区块标题。
- `font.family.sans` = `"IBM Plex Sans", "PingFang SC", "Microsoft YaHei", system-ui` —— 正文。
- `font.family.mono` = `"IBM Plex Mono", ui-monospace, Menlo` —— 价格 / 订单号 / 编码 / 数值。
> 在线走 Google Fonts，离线回退 PingFang SC / 系统无衬线，简体中文兜底。

## 6. 布局尺寸（硬约束）

| Token | 值 | 说明 |
|-------|----|------|
| `layout.screen` | 1280×720 dp | Android 横屏画布 |
| `layout.demobar.height` | 56dp | 顶部 Demo Bar |
| `layout.sidenav.width` | 112dp | 左侧 SideNav |
| `layout.content.area` | 1168×664 dp | 主内容区（1280-112 宽，720-56 高） |
| `layout.noScroll` | 主内容须在 664dp 高内免滚动 | 例外：订单/商品列表内部滚动 |
| `layout.split.listSummary` | 72% / 28% | LeftList+RightSummary 分栏 |

## 7. 触控（车载，来自 REQ-026）

| Token | 值 |
|-------|----|
| `touch.primaryButton.height` | 64dp（主操作最小高） |
| `touch.minTarget` | 48dp（任意可点最小热区） |
| `touch.iconButton` | 48×48dp |

## 8. 反馈（来自 REQ-029）

| Token | 值 |
|-------|----|
| `toast.duration` | 2500ms |
| `toast.concurrency` | 单条（按拦截优先级取最高） |
| `focus.ring` | 2dp solid #22D3C5（可达性焦点环，REQ-028；统一用电青绿强调色） |

## 9. 状态色映射

| 状态 | 颜色 |
|------|------|
| 订单「已支付」徽标 | color.success |
| 订单「已开通」徽标 | color.success |
| 会员「已开通」 | color.success |
| 会员「未开通」 | color.text.secondary |
| 「暂未开放」按钮 | color.disabledFill + color.text.disabled |
| Demo Bar active 项 | color.brand.primary 高亮底 |
