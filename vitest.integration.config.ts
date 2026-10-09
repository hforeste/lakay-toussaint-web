import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const databaseUrl = "postgres://lakay:local-development-only@127.0.0.1:54329/lakay_toussaint_test";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    include: ["tests/integration/**/*.test.ts"],
    globalSetup: ["./tests/integration/global-setup.ts"],
    fileParallelism: false,
    env: {
      DATABASE_URL: databaseUrl,
      PII_ENCRYPTION_KEY: "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=",
      PII_LOOKUP_KEY: "registration-tests-lookup-key-at-least-32-characters",
      APP_URL: "http://127.0.0.1:3000",
    },
  },
});
