import { defineConfig, devices } from "@playwright/test";

// L3 E2E：车机横屏 1280×720，前台 :5173（/api 代理 → :3001）。
export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.e2e.ts",
  fullyParallel: false, // 共享后端内存态，串行避免相互污染
  workers: 1,
  retries: 0,
  use: {
    baseURL: "http://localhost:5173",
    viewport: { width: 1280, height: 720 },
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 720 } } }],
  webServer: [
    {
      command: "npm run dev:server",
      url: "http://localhost:3001/api/health",
      reuseExistingServer: true,
      timeout: 30000,
    },
    {
      command: "npm run dev:web",
      url: "http://localhost:5173",
      reuseExistingServer: true,
      timeout: 30000,
    },
  ],
});
