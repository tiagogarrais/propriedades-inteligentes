const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_im83ophwtcLV@ep-muddy-snow-ac20yxgt-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  // Lista de raças por tipo
  const racas = [
    // Caprinos
    { tipo: "Caprino", raca: "Boer" },
    { tipo: "Caprino", raca: "Anglo-Nubiana" },
    { tipo: "Caprino", raca: "Saanen" },
    { tipo: "Caprino", raca: "Alpina" },
    { tipo: "Caprino", raca: "Toggenburg" },
    { tipo: "Caprino", raca: "Anglonubiano" },
    { tipo: "Caprino", raca: "Kalahari Red" },
    { tipo: "Caprino", raca: "Savana" },
    { tipo: "Caprino", raca: "Parda Alpina" },
    { tipo: "Caprino", raca: "Canindé" },

    // Ovinos
    { tipo: "Ovino", raca: "Dorper" },
    { tipo: "Ovino", raca: "Santa Inês" },
    { tipo: "Ovino", raca: "Suffolk" },
    { tipo: "Ovino", raca: "Hampshire Down" },
    { tipo: "Ovino", raca: "Texel" },
    { tipo: "Ovino", raca: "Ile de France" },
    { tipo: "Ovino", raca: "White Dorper" },

    // Bovinos
    { tipo: "Bovino", raca: "Nelore" },
    { tipo: "Bovino", raca: "Angus" },
    { tipo: "Bovino", raca: "Brahman" },
    { tipo: "Bovino", raca: "Hereford" },
    { tipo: "Bovino", raca: "Simental" },
    { tipo: "Bovino", raca: "Charolês" },
    { tipo: "Bovino", raca: "Limousin" },
    { tipo: "Bovino", raca: "Gir" },
    { tipo: "Bovino", raca: "Guzerá" },
    { tipo: "Bovino", raca: "Senepol" },

    // Suínos
    { tipo: "Suíno", raca: "Landrace" },
    { tipo: "Suíno", raca: "Large White" },
    { tipo: "Suíno", raca: "Duroc" },
    { tipo: "Suíno", raca: "Hampshire" },
    { tipo: "Suíno", raca: "Pietrain" },
    { tipo: "Suíno", raca: "Berkshire" },
    { tipo: "Suíno", raca: "Chester White" },

    // Equinos
    { tipo: "Equino", raca: "Quarto de Milha" },
    { tipo: "Equino", raca: "Mangalarga Marchador" },
    { tipo: "Equino", raca: "Crioulo" },
    { tipo: "Equino", raca: "Campolina" },
    { tipo: "Equino", raca: "Puro Sangue Inglês" },
    { tipo: "Equino", raca: "Paint Horse" },
    { tipo: "Equino", raca: "Appaloosa" },
  ];

  // Inserir todas as raças
  for (const { tipo, raca } of racas) {
    await prisma.racaCaracteristicas.upsert({
      where: {
        tipo_raca: { tipo, raca },
      },
      update: {},
      create: { tipo, raca },
    });
    console.log(`✓ ${tipo} - ${raca}`);
  }

  console.log(`\n✅ ${racas.length} raças inseridas com sucesso!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
