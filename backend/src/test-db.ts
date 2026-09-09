import { prisma } from "./lib/prisma";

async function main() {
  await prisma.$connect();

  console.log("✅ Prisma Client connected to PostgreSQL");

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error("❌ Database connection failed:", error);
  await prisma.$disconnect();
  process.exit(1);
});
