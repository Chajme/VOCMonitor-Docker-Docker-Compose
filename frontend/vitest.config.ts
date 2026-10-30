import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    // Spec 0 only scaffolds the runner; Spec 1 adds the first real tests.
    passWithNoTests: true,
  },
});
