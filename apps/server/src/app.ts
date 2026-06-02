import express, { type Express } from "express";
import cors from "cors";
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
  app.use(cors());
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
  return app;
}
