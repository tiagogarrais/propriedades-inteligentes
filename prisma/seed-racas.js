const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const racasCaprinas = [
  "Moxotó (nativa)",
  "Repartida ou Surrão (nativa)",
  "Marota ou Curaça (nativa)",
  "Canindé (nativa)",
  "Sem raça definida (SRD)",
  "Boer",
  "Anglo-nubiana (exótica)",
  "Saanen (exótica)",
  "Parda-alpina (exótica)",
  "Rebanho misto",
];

const racasOvinas = [
  "Santa Inês",
  "Dorper",
  "Suffolk",
  "Texel",
  "Ile de France",
  "Sem raça definida (SRD)",
  "Rebanho misto",
];

const racasBovinas = [
  "Nelore",
  "Angus",
  "Hereford",
  "Brangus",
  "Senepol",
  "Gir",
  "Guzerá",
  "Tabapuã",
  "Sem raça definida (SRD)",
  "Rebanho misto",
];

const racasSuinas = [
  "Large White",
  "Landrace",
  "Duroc",
  "Pietrain",
  "Hampshire",
  "Sem raça definida (SRD)",
  "Rebanho misto",
];

const racasEquinas = [
  "Mangalarga",
  "Crioulo",
  "Quarto de Milha",
  "Puro Sangue Inglês",
  "Árabe",
  "Sem raça definida (SRD)",
  "Rebanho misto",
];

async function main() {
  console.log("Iniciando seed de raças...");

  // Seed Caprinos
  for (const raca of racasCaprinas) {
    await prisma.racaCaracteristicas.upsert({
      where: {
        tipo_raca: {
          tipo: "Caprino",
          raca: raca,
        },
      },
      update: {},
      create: {
        tipo: "Caprino",
        raca: raca,
      },
    });
    console.log(`✓ Caprino: ${raca}`);
  }

  // Seed Ovinos
  for (const raca of racasOvinas) {
    await prisma.racaCaracteristicas.upsert({
      where: {
        tipo_raca: {
          tipo: "Ovino",
          raca: raca,
        },
      },
      update: {},
      create: {
        tipo: "Ovino",
        raca: raca,
      },
    });
    console.log(`✓ Ovino: ${raca}`);
  }

  // Seed Bovinos
  for (const raca of racasBovinas) {
    await prisma.racaCaracteristicas.upsert({
      where: {
        tipo_raca: {
          tipo: "Bovino",
          raca: raca,
        },
      },
      update: {},
      create: {
        tipo: "Bovino",
        raca: raca,
      },
    });
    console.log(`✓ Bovino: ${raca}`);
  }

  // Seed Suínos
  for (const raca of racasSuinas) {
    await prisma.racaCaracteristicas.upsert({
      where: {
        tipo_raca: {
          tipo: "Suíno",
          raca: raca,
        },
      },
      update: {},
      create: {
        tipo: "Suíno",
        raca: raca,
      },
    });
    console.log(`✓ Suíno: ${raca}`);
  }

  // Seed Equinos
  for (const raca of racasEquinas) {
    await prisma.racaCaracteristicas.upsert({
      where: {
        tipo_raca: {
          tipo: "Equino",
          raca: raca,
        },
      },
      update: {},
      create: {
        tipo: "Equino",
        raca: raca,
      },
    });
    console.log(`✓ Equino: ${raca}`);
  }

  console.log("\n✅ Seed de raças concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error("Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
