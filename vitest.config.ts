import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    setupFiles: ["./tests/unit/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: [
        "src/lib/events/**/*.ts",
        "src/lib/privacy.ts",
        "src/components/EventRegistrationForm.tsx",
        "src/components/CancelRegistrationButton.tsx",
        "admin/lib/registrations-query.ts",
      ],
    },
  },
});
