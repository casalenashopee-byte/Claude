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
- App instalável (PWA) — "adicionar à tela de início" no celular

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

## Deploy em produção

### Opção 1 — Docker (recomendado para self-host: VPS, Fly.io, Railway…)

O `Dockerfile` gera uma imagem enxuta (Next.js standalone) e persiste o
banco SQLite num volume, então os dados sobrevivem a reinícios/atualizações
do container.

```bash
cp .env.example .env
echo "AUTH_SECRET=$(openssl rand -hex 32)" >> .env

docker compose up -d --build
```

Isso sobe o app em `http://localhost:3000`, roda as migrações
automaticamente no boot (`docker-entrypoint.sh`) e guarda o banco no volume
`vendafacil-data`. Crie sua conta em `/registrar` (o script de seed não roda
dentro do container — ele depende de `tsx`, que fica só no ambiente de
desenvolvimento).

Variáveis de SMTP (opcionais, para o "esqueci minha senha" enviar e-mail de
verdade) podem ser definidas no `.env` antes do `docker compose up` — veja
`.env.example`.

> **Importante:** SQLite não funciona em ambientes serverless (Vercel,
> Netlify Functions…) porque o sistema de arquivos não é persistente entre
> execuções. Para esses ambientes, use a opção 2 (Postgres) — ou hospede
> este Dockerfile num VPS/Fly.io/Railway, que têm disco persistente.

### Opção 2 — Trocar para Postgres (necessário para deploy serverless)

1. Em `prisma/schema.prisma`, troque o datasource:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Aponte `DATABASE_URL` para seu Postgres (Neon, Supabase, RDS…):
   `postgresql://usuario:senha@host:5432/banco`
3. Rode `npx prisma migrate deploy` (as migrações existentes são
   compatíveis — os tipos usados no schema são portáveis entre SQLite e
   Postgres).
4. Publique normalmente na plataforma serverless de sua preferência.

## Segurança & isolamento entre contas

Cada tabela sensível guarda um `userId`, e toda leitura/escrita passa pela
sessão logada (`requireUser()`) filtrando por esse `userId` — uma conta não
enxerga produtos, vendas, clientes etc. de outra. Toda referência a um ID de
outra tabela vinda do formulário (cliente, canal, produto, forma de
pagamento, categoria, fornecedor) é conferida contra o dono antes de salvar,
para que uma requisição adulterada não consiga vincular uma venda ao cliente
de outra conta nem alterar o estoque de um produto alheio — o
`tests/smoke.spec.ts` tem um teste dedicado a isso (cria uma segunda conta,
forja o campo e confirma que o servidor recusa).

Outros pontos:
- Senha com bcrypt, sessão em cookie `httpOnly` assinado (JWT), nunca em `localStorage`.
- Em produção, o app recusa subir com `AUTH_SECRET` fraco ou igual ao valor de exemplo.
- Link de redefinição de senha usa `APP_URL` (não o header `Host` da
  requisição, que pode ser forjado) — configure-o em produção.
- Rate limiting simples (em memória) em login, registro e pedido de reset de
  senha, para dificultar força bruta. Limitação conhecida: reseta ao
  reiniciar o processo e não é compartilhado entre múltiplas instâncias.
- `npm audit` limpo (0 vulnerabilidades) — veja o `overrides` no
  `package.json` para a última correção aplicada.
- Sem CAPTCHA/proteção contra criação em massa de contas em `/registrar` —
  ok para uso interno, considere adicionar antes de abrir cadastro público
  em grande escala.

## CI

`.github/workflows/ci.yml` roda lint, typecheck e build a cada push/PR — o
mesmo `npx prisma generate` + `npm run build` que você rodaria localmente.

## Estrutura

- `prisma/schema.prisma` — modelo de dados completo (produtos, vendas,
  serviços, financeiro, catálogo, loja, indicações, reset de senha…)
- `src/actions/*` — Server Actions (uma por domínio) com toda a regra de negócio
- `src/lib/calc.ts` — cálculo de margem, taxas de pagamento e lucro líquido
- `src/lib/analytics.ts` / `src/lib/dashboard.ts` / `src/lib/cashflow.ts` —
  agregações financeiras
- `src/lib/image.ts` — compressão/redimensionamento de fotos no navegador
  antes de salvar (sem depender de um serviço de upload externo)
- `src/app/(app)/*` — telas autenticadas (sidebar com os mesmos grupos do
  produto de referência: Menu principal, Financeiro, Marketing, Cadastros,
  Configuração)
- `src/app/c/[slug]` — catálogo público (vitrine, sem carrinho)
- `src/app/loja/[slug]` — loja virtual pública (carrinho + checkout via WhatsApp)
- `src/app/esqueci-senha` / `src/app/redefinir-senha/[token]` — recuperação de senha

## Simplificações conscientes desta versão

- Não há gateway de pagamento nem cobrança automática de assinatura — todas
  as contas rodam com todos os recursos liberados (sem bloqueio por plano).
- Fotos são enviadas do dispositivo e salvas comprimidas no próprio banco
  (sem CDN/bucket externo) — ótimo para o volume de um pequeno vendedor,
  mas não é a arquitetura ideal para um catálogo com milhares de fotos.
- "Esqueci minha senha" envia e-mail de verdade só se você configurar SMTP
  no `.env`; sem isso, o link de redefinição é impresso no log do servidor
  (o self-hoster consegue pegar o link ali).
- Giro de estoque usa a média entre estoque inicial (reconstruído a partir
  do que foi vendido no período) e estoque atual — não há uma correção
  manual de quantidade auditada, então um ajuste manual no meio do período
  não entra na conta.
- O saque do "Indique e ganhe" apenas registra a solicitação — não há PIX
  automático.
- Produtos/clientes com muitos registros usam paginação simples
  (20 por página); os filtros de estoque de Produtos ainda comparam em
  memória (leve até alguns milhares de itens).

Nenhuma dessas simplificações compromete o uso real do dia a dia — são
pontos naturais de evolução futura.
