// Vitest config. Kept separate from next.config.ts — Next's static export
// build and the test runner share the `@/` alias but nothing else.
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
