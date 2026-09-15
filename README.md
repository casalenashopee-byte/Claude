# VendaFácil

Gestão de vendas para quem vende sozinho — dashboard, produtos e estoque,
vendas e serviços, financeiro (caixa, contas a receber, gastos, analytics),
catálogo online, loja virtual com checkout via WhatsApp e programa de
indicação. Web app feito com Next.js, pensado como alternativa própria a
ferramentas como o VendaMax.

## Stack

- **Next.js 16** (App Router, Server Actions) + TypeScript
- **Tailwind CSS v4**
- **Prisma + SQLite** (banco em arquivo único, fácil de rodar em qualquer lugar)
- Autenticação própria (cookie de sessão assinado com JWT + bcrypt), sem serviços externos

## Como rodar localmente

```bash
npm install

cp .env.example .env
# edite o .env: defina AUTH_SECRET e, se quiser já criar sua conta pelo seed,
# preencha SEED_USER_EMAIL / SEED_USER_PASSWORD / SEED_USER_NAME / SEED_COMPANY_NAME

npx prisma migrate dev --name init   # cria o banco SQLite (prisma/dev.db)
npm run db:seed                      # cria sua conta a partir do .env (opcional — dá pra usar /registrar também)

npm run dev
```

Abra http://localhost:3000 — você será redirecionado para `/login` (ou crie
uma conta em `/registrar` se não rodou o seed).

## Scripts

- `npm run dev` — desenvolvimento
- `npm run build` / `npm start` — build e execução em produção
- `npm run lint` — ESLint
- `npm run db:migrate` — cria/aplica migrações do Prisma
- `npm run db:seed` — roda `prisma/seed.ts`
- `npm run db:studio` — abre o Prisma Studio para inspecionar o banco

## Estrutura

- `prisma/schema.prisma` — modelo de dados completo (produtos, vendas,
  serviços, financeiro, catálogo, loja, indicações…)
- `src/actions/*` — Server Actions (uma por domínio) com toda a regra de negócio
- `src/lib/calc.ts` — cálculo de margem, taxas de pagamento e lucro líquido
- `src/lib/analytics.ts` / `src/lib/dashboard.ts` / `src/lib/cashflow.ts` —
  agregações financeiras
- `src/app/(app)/*` — telas autenticadas (sidebar com os mesmos grupos do
  produto de referência: Menu principal, Financeiro, Marketing, Cadastros,
  Configuração)
- `src/app/c/[slug]` — catálogo público (vitrine, sem carrinho)
- `src/app/loja/[slug]` — loja virtual pública (carrinho + checkout via WhatsApp)

## Simplificações conscientes desta primeira versão

- Não há gateway de pagamento nem cobrança automática de assinatura — todas
  as contas rodam com todos os recursos liberados (sem bloqueio por plano).
- Fotos de produto/catálogo são por URL (sem upload de arquivo/CDN).
- Giro de estoque, liquidez e ciclo de caixa no Analytics usam o
  estoque/caixa **atuais** como aproximação (o produto não guarda histórico
  diário de saldo).
- O saque do "Indique e ganhe" apenas registra a solicitação — não há PIX
  automático.
- Variações de produto (cor/tamanho) calculam a pré-visualização das
  combinações, mas ainda não são selecionáveis dentro de uma venda.

Nenhuma dessas simplificações compromete o uso real do dia a dia — são
pontos naturais de evolução futura.
