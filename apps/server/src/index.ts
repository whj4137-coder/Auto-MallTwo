import { createApp } from "./app.js";

const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || "0.0.0.0";

createApp().listen(PORT, HOST, () => {
  const shownHost = HOST === "0.0.0.0" ? "localhost" : HOST;
  console.log(`[apex-server] listening on http://${shownHost}:${PORT}/api`);
});
