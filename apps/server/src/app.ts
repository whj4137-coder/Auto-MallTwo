import express, { type Express } from "express";
import cors from "cors";
import fs from "node:fs";
import path from "node:path";
import { catalogRouter } from "./routes/catalog.js";
import { authRouter } from "./routes/auth.js";
import { cartRouter } from "./routes/cart.js";
import { checkoutRouter } from "./routes/checkout.js";
import { ordersRouter } from "./routes/orders.js";
import { demoRouter } from "./routes/demo.js";
import { adminRouter } from "./routes/admin.js";

// 构建 Express app（不 listen）。index.ts 起服务，测试用 supertest 直接挂载。
export function createApp(): Express {
  const app = express();
  // 仅放行本地开发跨域（前台 vite :5173 → API :3001）。生产为单服务同源，浏览器请求不触发 CORS。
  // 无 Origin 的请求（curl/同源/服务间）默认放行。收紧自全开 cors()（I-026）。
  app.use(cors({ origin: [/^https?:\/\/localhost(:\d+)?$/, /^https?:\/\/127\.0\.0\.1(:\d+)?$/] }));
  app.use(express.json());

  const api = express.Router();
  api.get("/health", (_req, res) => res.json({ code: 0, message: "OK", data: { up: true } }));
  api.use(catalogRouter);
  api.use(authRouter);
  api.use(cartRouter);
  api.use(checkoutRouter);
  api.use(ordersRouter);
  api.use(demoRouter);
  api.use(adminRouter);
  app.use("/api", api);

  const webDistCandidates = [
    process.env.WEB_DIST_DIR,
    path.resolve(process.cwd(), "apps/web/dist"),
    path.resolve(process.cwd(), "../web/dist"),
  ].filter(Boolean) as string[];
  const webDist = webDistCandidates.find((dir) => fs.existsSync(path.join(dir, "index.html")));
  if (webDist) {
    app.use(express.static(webDist));
    app.get("*", (_req, res) => res.sendFile(path.join(webDist, "index.html")));
  }

  return app;
}
