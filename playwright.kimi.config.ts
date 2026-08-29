import { loadEnvConfig } from "@next/env";
import { defineConfig } from "@playwright/test";

loadEnvConfig(process.cwd());

process.env.KIMI_CONTEXT_MODEL ||= "kimi-k2.6";
process.env.KIMI_PRACTICE_MODEL ||= "kimi-k2.6";
process.env.KIMI_FEEDBACK_MODEL ||= "kimi-k2.6";

export default defineConfig({
  testDir: "./tests/live",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 180_000,
  reporter: "list",
});
