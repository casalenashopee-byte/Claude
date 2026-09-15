import { test, expect } from "@playwright/test";

const EMAIL = "teste@vendafacil.local";
const PASSWORD = "senha-teste-123";

test.describe.configure({ mode: "serial" });

async function login(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.fill('input[name="email"]', EMAIL);
  await page.fill('input[name="password"]', PASSWORD);
  await Promise.all([
    page.waitForURL("**/dashboard"),
    page.click('button[type="submit"]'),
  ]);
}

test("login redireciona para o dashboard", async ({ page }) => {
  await login(page);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
});

test("rota protegida sem sessão volta para /login", async ({ page }) => {
  await page.goto("/produtos");
  await expect(page).toHaveURL(/\/login$/);
});

test("cadastra produto e vê refletido na listagem", async ({ page }) => {
  await login(page);
  await page.goto("/produtos/novo");
  await page.fill('input[name="name"]', "Produto de Teste E2E");
  await page.getByRole("button", { name: "Financeiro" }).click();
  await page.fill('input[name="costPrice"]', "10");
  await page.fill('input[name="retailPrice"]', "25");
  await Promise.all([
    page.waitForURL("**/produtos"),
    page.getByRole("button", { name: "Salvar produto" }).click(),
  ]);
  await expect(page.getByText("Produto de Teste E2E")).toBeVisible();
});

test("registra uma venda e calcula o lucro corretamente", async ({ page }) => {
  await login(page);
  await page.goto("/vendas/nova");

  const productSelect = page.locator("select").first();
  const optionValue = await productSelect
    .locator("option", { hasText: "Produto de Teste E2E" })
    .first()
    .getAttribute("value");
  await productSelect.selectOption(optionValue!);
  await page.getByRole("button", { name: "Adicionar" }).first().click();

  // Escolhe PIX explicitamente (taxa 0%) — lucro deve ser 25 - 10 = 15.
  const paymentSelect = page.locator("select", { hasText: "PIX" });
  const pixValue = await paymentSelect.locator("option", { hasText: "PIX" }).getAttribute("value");
  await paymentSelect.selectOption(pixValue!);

  await expect(page.getByText("Lucro líquido:")).toContainText("R$");
  await expect(page.locator("strong", { hasText: "R$" }).last()).toHaveText("R$ 15,00");

  await Promise.all([
    page.waitForURL("**/vendas"),
    page.getByRole("button", { name: "Registrar venda" }).click(),
  ]);
  await expect(page.getByText(/R\$\s*15,00/)).toBeVisible();
});

test("manifest.webmanifest responde com ícones (PWA instalável)", async ({ request }) => {
  const res = await request.get("/manifest.webmanifest");
  expect(res.status()).toBe(200);
  const json = await res.json();
  expect(json.icons?.length).toBeGreaterThanOrEqual(2);
});
