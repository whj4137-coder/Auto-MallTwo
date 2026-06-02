# 构建变体 — Apex Drive Store V2

> **这是什么**：不同运行环境/构建目标的差异。Demo 阶段以「PC 横屏模拟」为主。

## 1. 变体一览

| 变体 | 目标 | 用途 | 状态 |
|------|------|------|------|
| `web-pc` | PC 浏览器 1280×720 视口 | 评审演示主环境 | 主推 |
| `web-headunit` | Android WebView（横屏 1280×720 dp） | 车机承载 | 次要 |
| `admin` | PC 浏览器（/admin 路由） | 后台只读核对 | 主推 |

> 三者共用同一前端构建产物与同一后端；差异仅在承载容器与视口。

## 2. 环境配置

| 变量 | 说明 | 默认 |
|------|------|------|
| `VITE_PUBLIC_API_BASE` | 后端地址 | `http://localhost:3001/api/v1` |
| `DEMO_PREFIX` | 调试栏前缀 | `DEMO` |
| `APP_NAME` | 应用显示名 | `Apex Drive Store` |
| `VIEWPORT` | 模拟视口 | `1280x720` |

- 主题固定（深色座舱 Dark Cockpit），无明暗切换开关。
- 语言固定简体中文，无 i18n 切换。
- 前端只读 `VITE_PUBLIC_*` 前缀变量，避免泄漏。

### 2.1 环境变量分层
| 文件 | 用途 | 入仓 |
|------|------|------|
| `.env.local` | 本地开发覆盖 | 否（gitignore） |
| `.env.development` | 开发模板（含示例值） | 是 |
| `.env.production` | 生产模板（含示例值） | 是 |

> Demo 阶段无真实密钥；如后续有敏感变量，只经部署平台 secret 注入，不写入任何 .env。

### 2.2 本地端口约定
| 服务 | 地址 |
|------|------|
| 前端 H5 dev（Vite） | http://localhost:5173 |
| 后端 API（Express） | http://localhost:3001 |
| 视口模拟 | DevTools 自定义设备 1280×720 |

## 3. 构建命令（推荐栈）
```bash
pnpm --filter web build       # 产出静态资源（web-pc / web-headunit 共用）
pnpm --filter server build    # 后端打包
```

## 4. 车机承载（web-headunit）说明
- 以 Android WebView 加载前台构建产物；锁定横屏，禁用系统缩放。
- WebView 不引入真实支付/语音；模拟扫码为纯前端交互。
- Demo 状态（drive/net/auth）仍由应用内 Demo Bar 控制，不接车辆真实信号。

## 5. 数据与重置
- 所有变体共享后端内存数据；`POST /api/demo/reset` 对所有变体生效。
- 无打包级别的数据差异；seed 来自 PRD §10 数据契约。
