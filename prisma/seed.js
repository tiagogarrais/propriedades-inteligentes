const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  // Inserir características da raça Boer
  await prisma.racaCaracteristicas.upsert({
    where: {
      tipo_raca: {
        tipo: "Caprino",
        raca: "Boer (exótica)",
      },
    },
    update: {},
    create: {
      tipo: "Caprino",
      raca: "Boer (exótica)",
      origem: "África do Sul",
      pesoNascer: 4.0,
      peso10Meses: 40.0,
      pesoMachoAdulto: 95.0,
      pesoFemeaAdulta: 85.0,
    },
  });

  console.log("Características da raça Boer inseridas com sucesso!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
