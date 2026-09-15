import { prisma } from "./prisma";

const DEFAULT_CATEGORIES = [
  "Acessórios",
  "Alimentos",
  "Cosméticos",
  "Eletrônicos",
  "Roupas",
];

const DEFAULT_CHANNELS = [
  "Instagram",
  "Loja Física",
  "Mercado Livre",
  "Shopee",
  "WhatsApp",
];

const DEFAULT_PAYMENT_METHODS = [
  { name: "PIX", feePct: 0, feeFixed: 0 },
  { name: "Dinheiro", feePct: 0, feeFixed: 0 },
  { name: "Cartão de Débito", feePct: 1.99, feeFixed: 0 },
  { name: "Cartão de Crédito", feePct: 3.49, feeFixed: 0 },
  { name: "Boleto", feePct: 0, feeFixed: 3.5 },
];

function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Popula uma conta nova com os padrões do produto — nunca entrega a tela vazia. */
export async function provisionNewUser(userId: string, companyName?: string | null) {
  await prisma.category.createMany({
    data: DEFAULT_CATEGORIES.map((name) => ({ userId, name })),
  });

  await prisma.channel.createMany({
    data: DEFAULT_CHANNELS.map((name) => ({ userId, name })),
  });

  await prisma.paymentMethod.createMany({
    data: DEFAULT_PAYMENT_METHODS.map((m) => ({ userId, ...m })),
  });

  const base = slugify(companyName || "minha-loja") || "loja";
  let slug = base;
  let n = 1;
  while (await prisma.catalogSettings.findUnique({ where: { slug } })) {
    n += 1;
    slug = `${base}-${n}`;
  }

  await prisma.catalogSettings.create({
    data: {
      userId,
      slug,
      title: companyName || "Meu catálogo",
    },
  });

  await prisma.storeSettings.create({
    data: {
      userId,
      sections: JSON.stringify(
        [
          "anuncio",
          "banner",
          "busca",
          "categorias",
          "confianca",
          "destaques",
          "rodape",
          "whatsapp",
        ].map((key, i) => ({ key, enabled: true, order: i }))
      ),
    },
  });

  await prisma.referralWallet.create({ data: { userId } });
}
