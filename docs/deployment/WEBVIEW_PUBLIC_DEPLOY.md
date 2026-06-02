# WebView APK + 公网部署交付指南

## 目标形态

- 前台在线试用：`https://<domain>/`
- 运营后台：`https://<domain>/admin`（账号 `admin` / `123456`）
- 服务端 API：`https://<domain>/api`
- Android APK：WebView 壳打开同一个公网前台地址
- 源码仓库：GitHub/GitLab remote + tag `v1.0.0`

## 单服务部署

本仓库已支持一个 Express 服务同时托管前台静态包和 `/api`：

```bash
npm install
npm run build:release
HOST=0.0.0.0 PORT=3001 npm run start:prod
```

访问：

```text
http://localhost:3001/
http://localhost:3001/admin
http://localhost:3001/api/health
```

## Docker 部署

```bash
docker build -t apex-drive-store:1.0.0 .
docker run -d --name apex-drive-store -p 3001:3001 apex-drive-store:1.0.0
```

反向代理把公网 HTTPS 域名转发到 `127.0.0.1:3001` 即可。

## Nginx 反代示例

```nginx
server {
  server_name carshop.example.com;

  location / {
    proxy_pass http://127.0.0.1:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}
```

TLS 证书可用云厂商证书或 certbot 配置。

## APK 构建

```bash
cd android-webview
gradle :app:assembleDebug -PWEBVIEW_URL=https://carshop.example.com/
```

Debug APK 产物：

```text
android-webview/app/build/outputs/apk/debug/app-debug.apk
```

## 当前限制

- 后端仍是内存存储，适合 Demo；公网 24/7 长跑建议下一步接 SQLite。
- 当前 WebView 壳未配置正式签名；正式分发需配置 keystore。
- S-037 已在本机实测：单服务 `start:prod`（`/`、`/admin`、`/api/*` 均通）、debug APK 工具链、本地 commit + `v1.0.0` tag 均完成；**公网部署与 push 待对外域名 / git remote**。
