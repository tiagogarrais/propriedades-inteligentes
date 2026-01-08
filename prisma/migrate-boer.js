const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando migração para mesclar raças Boer...");

  // Verificar se existe "Boer (exótica)"
  const boerExotica = await prisma.racaCaracteristicas.findUnique({
    where: {
      tipo_raca: {
        tipo: "Caprino",
        raca: "Boer (exótica)",
      },
    },
  });

  // Verificar se existe "Boer"
  const boer = await prisma.racaCaracteristicas.findUnique({
    where: {
      tipo_raca: {
        tipo: "Caprino",
        raca: "Boer",
      },
    },
  });

  if (boerExotica && !boer) {
    // Se só existe "Boer (exótica)", renomear para "Boer"
    console.log("Renomeando 'Boer (exótica)' para 'Boer'...");
    await prisma.racaCaracteristicas.update({
      where: {
        tipo_raca: {
          tipo: "Caprino",
          raca: "Boer (exótica)",
        },
      },
      data: {
        raca: "Boer",
      },
    });
    console.log("Raça renomeada com sucesso!");
  } else if (boerExotica && boer) {
    // Se existem ambas, mesclar dados de "Boer (exótica)" para "Boer" e remover "Boer (exótica)"
    console.log("Mesclando dados de 'Boer (exótica)' para 'Boer'...");

    // Atualizar "Boer" com dados de "Boer (exótica)" se estiverem vazios
    const updateData = {};
    Object.keys(boerExotica).forEach((key) => {
      if (
        key !== "id" &&
        key !== "tipo" &&
        key !== "raca" &&
        boer[key] === null &&
        boerExotica[key] !== null
      ) {
        updateData[key] = boerExotica[key];
      }
    });

    if (Object.keys(updateData).length > 0) {
      await prisma.racaCaracteristicas.update({
        where: {
          tipo_raca: {
            tipo: "Caprino",
            raca: "Boer",
          },
        },
        data: updateData,
      });
      console.log("Dados mesclados com sucesso!");
    }

    // Remover "Boer (exótica)"
    await prisma.racaCaracteristicas.delete({
      where: {
        tipo_raca: {
          tipo: "Caprino",
          raca: "Boer (exótica)",
        },
      },
    });
    console.log("Entrada duplicada 'Boer (exótica)' removida!");
  } else if (!boerExotica && !boer) {
    console.log(
      "Nenhuma entrada Boer encontrada. O seed será executado normalmente."
    );
  } else {
    console.log("Apenas 'Boer' existe, nenhuma ação necessária.");
  }

  console.log("Migração concluída!");
}

main()
  .catch((e) => {
    console.error("Erro durante a migração:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
