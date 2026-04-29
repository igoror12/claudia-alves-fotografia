import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // ─── Categorias base ───────────────────────────────────────────
  const categories = [
    { slug: "retratos", name: "Retratos", description: "Sessões individuais, familiares e editoriais.", order: 1 },
    { slug: "casamentos", name: "Casamentos", description: "Cobertura completa do dia mais importante.", order: 2 },
    { slug: "eventos", name: "Eventos", description: "Batizados, festas, eventos corporativos.", order: 3 },
  ];

  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: c,
      create: c,
    });
  }

  // ─── Conta admin (Cláudia) ─────────────────────────────────────
  const email = process.env.ADMIN_EMAIL ?? "claudia@claudiaalves.pt";
  const password = process.env.ADMIN_PASSWORD ?? "trocar-em-producao";
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: { passwordHash },
    create: {
      email,
      name: "Cláudia Alves",
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log("✓ Seed concluído: 3 categorias + admin", email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
