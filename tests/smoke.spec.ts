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

test("uma conta não consegue vincular uma venda ao cliente de outra conta (IDOR)", async ({ page, browser }) => {
  // Conta "vítima": cria um cliente privado e guarda o ID real dele.
  await login(page);
  await page.goto("/clientes/novo");
  await page.fill('input[name="name"]', "Cliente Privado da Vítima");
  await Promise.all([
    page.waitForURL("**/clientes"),
    page.getByRole("button", { name: "Salvar" }).click(),
  ]);
  const editLink = page.locator('a[href^="/clientes/"]').first();
  const victimCustomerId = (await editLink.getAttribute("href"))?.split("/").pop();
  expect(victimCustomerId).toBeTruthy();

  // Conta "atacante": nova sessão, nova conta, sem nenhum vínculo com a vítima.
  const attackerContext = await browser.newContext();
  const attackerPage = await attackerContext.newPage();
  await attackerPage.goto("/registrar");
  await attackerPage.fill('input[name="name"]', "Atacante");
  await attackerPage.fill('input[name="email"]', `atacante-${Date.now()}@vendafacil.local`);
  await attackerPage.fill('input[name="password"]', "senhaAtacante123");
  await Promise.all([
    attackerPage.waitForURL("**/dashboard"),
    attackerPage.getByRole("button", { name: "Criar conta grátis" }).click(),
  ]);

  await attackerPage.goto("/vendas/nova");
  await attackerPage.getByRole("button", { name: "Item avulso" }).click();

  // Simula alguém adulterando o formulário (ex.: DevTools) para forjar o
  // customerId — a UI normal nunca ofereceria o ID de outra conta aqui.
  await attackerPage
    .locator("select", { hasText: "Cliente cadastrado" })
    .selectOption({ label: "Cliente cadastrado" });
  await attackerPage.evaluate((victimId) => {
    const select = document.querySelector('select[name="customerId"]') as HTMLSelectElement;
    const opt = document.createElement("option");
    opt.value = victimId as string;
    opt.selected = true;
    select.appendChild(opt);
    select.value = victimId as string;
  }, victimCustomerId);

  await attackerPage.getByRole("button", { name: "Registrar venda" }).click();
  await attackerPage.waitForTimeout(1000);

  // Deve barrar no servidor: continua em /vendas/nova mostrando o erro,
  // nunca cria a venda vinculada ao cliente de outra conta.
  await expect(attackerPage).toHaveURL(/\/vendas\/nova$/);
  await expect(attackerPage.getByText("Cliente inválido.")).toBeVisible();

  await attackerContext.close();
});

test("manifest.webmanifest responde com ícones (PWA instalável)", async ({ request }) => {
  const res = await request.get("/manifest.webmanifest");
  expect(res.status()).toBe(200);
  const json = await res.json();
  expect(json.icons?.length).toBeGreaterThanOrEqual(2);
});
