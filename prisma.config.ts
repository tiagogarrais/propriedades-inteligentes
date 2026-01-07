import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "./prisma/schema.prisma",
  migrations: {
    seed: "node ./prisma/seed.js",
  },
  datasource: {
    provider: "postgresql",
    url: "postgresql://neondb_owner:npg_im83ophwtcLV@ep-muddy-snow-ac20yxgt-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  },
});
