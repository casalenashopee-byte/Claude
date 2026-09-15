import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { provisionNewUser } from "../src/lib/provision";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_USER_EMAIL;
  const password = process.env.SEED_USER_PASSWORD;
  const name = process.env.SEED_USER_NAME || "Você";
  const companyName = process.env.SEED_COMPANY_NAME || null;

  if (!email || !password) {
    console.log(
      "SEED_USER_EMAIL / SEED_USER_PASSWORD não definidos no .env — nada para semear."
    );
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Usuário ${email} já existe — seed ignorado.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash, name, companyName },
  });

  await provisionNewUser(user.id, companyName);

  console.log(`Conta criada para ${email}. Já pode fazer login em /login.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
