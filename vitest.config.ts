import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Vitest configuration for SignalFlow. Tests target the pure deterministic
// engines only. They import no React, no Prisma, and no database, so they run
// fast and need no environment. The @ alias mirrors tsconfig paths.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
    coverage: {
      provider: "v8",
      include: [
        "lib/ai/**",
        "lib/voice/**",
        "lib/providers/**",
        "lib/feature-flags/**",
        "lib/review/**",
        "lib/orchestrator/**",
        "lib/outcomes/**",
        "lib/attribution/**",
      ],
    },
  },
});
