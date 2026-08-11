import { defineConfig, devices } from "@playwright/test";

/**
 * E2E. Precisa de `GITHUB_TOKEN` no ambiente — os testes batem na API de verdade,
 * que é o ponto: o que quebra em produção é o contrato com o GitHub, não o nosso
 * código isolado. As fórmulas em si já têm cobertura unitária em tests/unit.
 *
 * Antes da primeira execução: `npx playwright install chromium`.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",

  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
  },

  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],

  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
