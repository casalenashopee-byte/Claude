import { defineConfig } from "@playwright/test";

const PORT = 3100;

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    launchOptions: process.env.PW_LOCAL_CHROMIUM
      ? { executablePath: process.env.PW_LOCAL_CHROMIUM }
      : undefined,
  },
  webServer: {
    // Banco/porta dedicados — nunca toca no seu banco de desenvolvimento.
    command:
      "npx prisma migrate deploy && npx prisma db seed && npm run build && npm start -- -p " + PORT,
    url: `http://localhost:${PORT}/login`,
    reuseExistingServer: false,
    timeout: 180_000,
    env: {
      DATABASE_URL: "file:./test.db",
      // "next start" roda em modo produção, que recusa segredos fracos/de
      // exemplo (ver lib/auth.ts) — por isso um valor longo aqui, mesmo em teste.
      AUTH_SECRET: "e2e-test-only-4f8a1c9d7e2b4f6a0c1d8e5b3a7f2c94-never-use-in-prod",
      SEED_USER_EMAIL: "teste@vendafacil.local",
      SEED_USER_PASSWORD: "senha-teste-123",
      SEED_USER_NAME: "Conta de Teste",
      SEED_COMPANY_NAME: "Empresa de Teste",
    },
  },
});
