const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  // Inserir características da raça Boer
  await prisma.racaCaracteristicas.upsert({
    where: {
      tipo_raca: {
        tipo: "Caprino",
        raca: "Boer",
      },
    },
    update: {
      // Atualizar com as novas características
      origem: "África do Sul",
      pesoNascer: 3.5,
      peso10Meses: 35.0,
      pesoMachoAdulto: 110.0,
      pesoFemeaAdulta: 80.0,
      maturidadeSexual: 6,
      femeaTemLeite: true,
      periodoGestacao: 150,
      quantidadeCabritosParto: 2.5,
      abatePrecoceDias: 90,
      abateConvencionalDias: 165,
      abateTardioDiasMin: 180,
      abateTardioDiasMax: 360,
      pelagemCouro: "curto",
      maxFemeasPorMacho: 50,
      femeasPorMachoIdeal: 33,
      ganhoPesoDiaGramas: 350.0,
      percentualGorduraCarne: "menos de 3%",
      indiceColesterol: "baixo",
      indiceGorduraSaturada: "baixo",
      indiceCalorias: "baixo",
      carneMacia: true,
      carneSaborosa: true,
      carneSucculenta: true,
    },
    create: {
      tipo: "Caprino",
      raca: "Boer",
      origem: "África do Sul",
      pesoNascer: 3.5,
      peso10Meses: 35.0,
      pesoMachoAdulto: 110.0,
      pesoFemeaAdulta: 80.0,
      maturidadeSexual: 6,
      femeaTemLeite: true,
      periodoGestacao: 150,
      quantidadeCabritosParto: 2.5,
      abatePrecoceDias: 90,
      abateConvencionalDias: 165,
      abateTardioDiasMin: 180,
      abateTardioDiasMax: 360,
      pelagemCouro: "curto",
      maxFemeasPorMacho: 50,
      femeasPorMachoIdeal: 33,
      ganhoPesoDiaGramas: 350.0,
      percentualGorduraCarne: "menos de 3%",
      indiceColesterol: "baixo",
      indiceGorduraSaturada: "baixo",
      indiceCalorias: "baixo",
      carneMacia: true,
      carneSaborosa: true,
      carneSucculenta: true,
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
