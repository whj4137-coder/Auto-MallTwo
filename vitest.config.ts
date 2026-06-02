import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@apex/shared": fileURLToPath(new URL("./packages/shared/src/index.ts", import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: "node",
    include: ["apps/**/*.test.ts", "packages/**/*.test.ts"],
    exclude: ["**/node_modules/**", "**/*.e2e.ts"],
  },
});
